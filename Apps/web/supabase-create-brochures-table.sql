-- Create brochures table for the Investment Brief system
CREATE TABLE IF NOT EXISTS brochures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  pdf_file TEXT NOT NULL,
  thumbnail TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE brochures ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for brochures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('brochures', 'brochures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for brochures bucket
CREATE POLICY "Public can view brochure files"
ON storage.objects FOR SELECT
USING (bucket_id = 'brochures');

CREATE POLICY "Authenticated users can upload brochure files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'brochures' 
  AND auth.role() = 'authenticated'
  AND (LOWER(RIGHT(name, 4)) = '.pdf' OR LOWER(RIGHT(name, 4)) = '.jpg' OR LOWER(RIGHT(name, 4)) = '.png' OR LOWER(RIGHT(name, 4)) = '.webp' OR LOWER(RIGHT(name, 5)) = '.jpeg')
);

CREATE POLICY "Authenticated users can update brochure files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'brochures' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'brochures' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete brochure files"
ON storage.objects FOR DELETE
USING (bucket_id = 'brochures' AND auth.role() = 'authenticated');

-- RLS policies for brochures table
CREATE POLICY "Anyone can view published brochures"
ON brochures FOR SELECT
USING (status = 'published');

CREATE POLICY "Authenticated users can view all brochures"
ON brochures FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert brochures"
ON brochures FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update brochures"
ON brochures FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete brochures"
ON brochures FOR DELETE
USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_brochures_updated_at
  BEFORE UPDATE ON brochures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();