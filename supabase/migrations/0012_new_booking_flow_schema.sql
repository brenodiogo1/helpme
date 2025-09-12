-- Drop dependent policies and functions first
DROP POLICY IF EXISTS "Customers can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Cleaners can view their assigned bookings" ON public.bookings;
DROP POLICY IF EXISTS "Cleaners can update their assigned bookings status" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;

DROP POLICY IF EXISTS "Customers can insert job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Admins can manage all job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Cleaners can view their job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Cleaners can update their job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Customers can view job offers for their bookings" ON public.job_offers;

-- Drop tables that depend on bookings or are being replaced
DROP TABLE IF EXISTS public.job_offers CASCADE;
DROP TABLE IF EXISTS public.booking_addons CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.quick_bookings CASCADE;

-- Drop existing enums if they conflict or are replaced
DROP TYPE IF EXISTS public.booking_status CASCADE;

-- 1. Frequencies and discounts
CREATE TABLE public.plan_frequencies (
  code TEXT PRIMARY KEY,         -- 'once' | 'weekly' | 'biweekly'
  label_nl TEXT NOT NULL,
  discount NUMERIC NOT NULL      -- 0.00, 0.07, 0.04
);

INSERT INTO public.plan_frequencies VALUES
('once','Eenmalig',0.00),
('weekly','Wekelijks (bespaar 7%)',0.07),
('biweekly','Om de week (bespaar 4%)',0.04);

-- 2. Services and extras
CREATE TABLE public.services (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,            -- 'Find a cleaner'
  base_hourly_rate NUMERIC NOT NULL DEFAULT 16.90,
  service_fee NUMERIC NOT NULL DEFAULT 2.90,
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO public.services(name) VALUES ('Find a cleaner');

CREATE TABLE public.addons (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,            -- 'Ramen wassen', 'Oven reinigen'
  price NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO public.addons(name, price) VALUES
('Ramen wassen',25.00),
('Oven reinigen',15.00),
('Koelkast reinigen',15.00),
('Strijken (per uur)',10.00);

-- 3. Booking draft (step 1) and confirmation (step 3)
CREATE TYPE booking_status AS ENUM ('draft','pending_payment','paid','cancelled');

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_id BIGINT REFERENCES public.services(id),
  frequency_code TEXT REFERENCES public.plan_frequencies(code),
  home_size_m2 INT,
  duration_hours NUMERIC NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  allow_alt_weekday BOOLEAN DEFAULT FALSE,
  postcode TEXT,
  city TEXT,
  base_hourly_rate NUMERIC NOT NULL,
  discount NUMERIC NOT NULL,
  service_fee NUMERIC NOT NULL,
  addons_total NUMERIC NOT NULL DEFAULT 0,
  estimated_total NUMERIC NOT NULL,
  status booking_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.booking_addons (
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  addon_id BIGINT REFERENCES public.addons(id),
  qty INT DEFAULT 1,
  PRIMARY KEY (booking_id, addon_id)
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bookings" ON public.bookings
  FOR ALL USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

-- Admin policy for bookings (assuming admin role is in profiles table)
CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Allow anonymous insert for draft bookings (if customer_id is null)
CREATE POLICY "Allow anonymous insert for draft bookings" ON public.bookings
  FOR INSERT WITH CHECK (customer_id IS NULL);

-- Allow authenticated users to insert bookings
CREATE POLICY "Allow authenticated insert for bookings" ON public.bookings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);

-- Allow authenticated users to select their own bookings
CREATE POLICY "Allow authenticated select for own bookings" ON public.bookings
  FOR SELECT TO authenticated USING (auth.uid() = customer_id);

-- Allow authenticated users to update their own draft bookings
CREATE POLICY "Allow authenticated update for own draft bookings" ON public.bookings
  FOR UPDATE TO authenticated USING (auth.uid() = customer_id AND status = 'draft');

-- Allow authenticated users to delete their own draft bookings
CREATE POLICY "Allow authenticated delete for own draft bookings" ON public.bookings
  FOR DELETE TO authenticated USING (auth.uid() = customer_id AND status = 'draft');