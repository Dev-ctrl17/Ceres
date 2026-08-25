-- Agent applications submitted from /become-an-agent
CREATE TABLE IF NOT EXISTS agent_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  experience TEXT,
  specialization TEXT,
  message TEXT,
  photo_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE agent_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit agent applications"
  ON agent_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated admins can review agent applications"
  ON agent_applications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated admins can update agent applications"
  ON agent_applications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create this bucket as public so submitted profile URLs can be viewed by admins.
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-photos', 'agent-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Anyone can upload agent application photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'agent-photos');

CREATE POLICY "Anyone can view agent application photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'agent-photos');
