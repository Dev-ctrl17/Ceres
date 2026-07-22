-- ============================================================
-- Create ongoing_projects table
-- ============================================================
CREATE TABLE IF NOT EXISTS ongoing_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  estimated_delivery TEXT NOT NULL,
  address TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'In Progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE ongoing_projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for the public-facing page)
CREATE POLICY "Allow public read access"
  ON ongoing_projects
  FOR SELECT
  USING (true);

-- Allow authenticated users (admin) full CRUD
CREATE POLICY "Allow authenticated insert"
  ON ongoing_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update"
  ON ongoing_projects
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete"
  ON ongoing_projects
  FOR DELETE
  TO authenticated
  USING (true);