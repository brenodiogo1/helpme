CREATE TABLE public.quick_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  duration_hours NUMERIC NOT NULL,
  extra_services TEXT[],
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  notes TEXT,
  base_price NUMERIC NOT NULL,
  extras_price NUMERIC NOT NULL,
  discount_amount NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quick_bookings ENABLE ROW LEVEL SECURITY;

-- Permitir que usuários anônimos insiram quick bookings (formulário público)
CREATE POLICY "Allow anonymous insert for quick bookings" ON public.quick_bookings
FOR INSERT WITH CHECK (true);

-- Permitir que administradores visualizem e gerenciem todos os quick bookings
CREATE POLICY "Admins can manage all quick bookings" ON public.quick_bookings
FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));