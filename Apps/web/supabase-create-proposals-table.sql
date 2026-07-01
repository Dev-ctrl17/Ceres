-- Create proposals table for Client Success feature
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  client_name TEXT,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT,
  gallery TEXT[],
  document_url TEXT,
  property_type TEXT,
  location TEXT,
  result_highlight TEXT,
  date_completed DATE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_proposals_slug ON proposals(slug);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_date_completed ON proposals(date_completed DESC);

-- Enable Row Level Security
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Public can view published proposals
CREATE POLICY "Public can view published proposals"
  ON proposals FOR SELECT
  USING (status = 'published');

-- Authenticated users can view all proposals (for admin)
CREATE POLICY "Authenticated users can view all proposals"
  ON proposals FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only authenticated users can insert proposals
CREATE POLICY "Authenticated users can create proposals"
  ON proposals FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update proposals
CREATE POLICY "Authenticated users can update proposals"
  ON proposals FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Only authenticated users can delete proposals
CREATE POLICY "Authenticated users can delete proposals"
  ON proposals FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create storage bucket for proposal files (if not exists)
-- Run this in Supabase Storage section or via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('proposal-files', 'proposal-files', true);

-- Storage policies for proposal-files bucket
-- Policy: Public can view files
-- CREATE POLICY "Public can view proposal files"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'proposal-files');

-- Policy: Authenticated users can upload files
-- CREATE POLICY "Authenticated users can upload proposal files"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'proposal-files' AND auth.role() = 'authenticated');

-- Policy: Authenticated users can update files
-- CREATE POLICY "Authenticated users can update proposal files"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'proposal-files' AND auth.role() = 'authenticated');

-- Policy: Authenticated users can delete files
-- CREATE POLICY "Authenticated users can delete proposal files"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'proposal-files' AND auth.role() = 'authenticated');

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_proposals_updated_at();

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_proposal_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
  counter INTEGER := 0;
  base_slug TEXT;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(title, '[^a-z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  slug := base_slug;
  
  -- Check if slug exists, if so, append counter
  WHILE EXISTS (SELECT 1 FROM proposals WHERE slug = slug) LOOP
    counter := counter + 1;
    slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql;