-- Create nl_postcodes table
CREATE TABLE public.nl_postcodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  postcode TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  province TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.nl_postcodes ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (e.g., for address autocompletion)
CREATE POLICY "Public read access for nl_postcodes" ON public.nl_postcodes
FOR SELECT USING (true);