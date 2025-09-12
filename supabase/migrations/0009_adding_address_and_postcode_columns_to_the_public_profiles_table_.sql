-- Add address column to profiles table
ALTER TABLE public.profiles
ADD COLUMN address TEXT;

-- Add postcode column to profiles table
ALTER TABLE public.profiles
ADD COLUMN postcode TEXT;

-- Update RLS policies for profiles to allow users to update their own address and postcode
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Optional: If you want to allow authenticated users to update their own phone number, address, and postcode
DROP POLICY IF EXISTS "Allow authenticated users to update their own phone number" ON public.profiles;
CREATE POLICY "Allow authenticated users to update their own profile details" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);