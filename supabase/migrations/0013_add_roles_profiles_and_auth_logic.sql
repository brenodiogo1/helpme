-- Tipos
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin','cleaner','customer'); -- Changed 'provider' to 'customer' based on existing app context
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE approval_status AS ENUM ('pending','approved','rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Profiles (1–1 com auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer', -- Changed 'provider' to 'customer'
  cleaner_status approval_status,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  postcode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for 'profiles' table
DROP TRIGGER IF EXISTS _touch_profiles ON public.profiles;
CREATE TRIGGER _touch_profiles BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Cria profile no 1º login (lê metadata signup_role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  desired_role TEXT := COALESCE(NEW.raw_user_meta_data->>'signup_role', 'customer'); -- Changed 'provider' to 'customer'
  user_full_name TEXT := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
BEGIN
  INSERT INTO public.profiles(id, role, cleaner_status, full_name)
  VALUES (
    NEW.id,
    desired_role::user_role,
    CASE WHEN desired_role = 'cleaner' THEN 'pending'::approval_status ELSE NULL END,
    user_full_name
  );
  RETURN NEW;
END;
$$;

-- Trigger for 'auth.users' table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Self select" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Self update limited" ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (role = OLD.role AND (CASE WHEN OLD.role='cleaner'
  THEN cleaner_status = OLD.cleaner_status ELSE TRUE END));

CREATE POLICY "Admins full access" ON public.profiles
FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.role='admin'))
WITH CHECK (TRUE);