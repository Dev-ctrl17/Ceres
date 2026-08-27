CREATE TABLE IF NOT EXISTS prospect_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_name text NOT NULL,
  prospect_phone text NOT NULL,
  prospect_email text NOT NULL,
  property_suggestion text NOT NULL,
  relationship text NOT NULL,
  submitter_name text NOT NULL,
  submitter_phone text NOT NULL,
  submitter_email text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE prospect_referrals ENABLE ROW LEVEL SECURITY;

ALTER TABLE prospect_referrals ADD COLUMN IF NOT EXISTS prospect_email text;

ALTER TABLE prospect_referrals ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'New';
ALTER TABLE prospect_referrals ADD COLUMN IF NOT EXISTS email_sent boolean NOT NULL DEFAULT false;
ALTER TABLE prospect_referrals ADD COLUMN IF NOT EXISTS delivery_error text;
ALTER TABLE prospect_referrals ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE prospect_referrals DROP CONSTRAINT IF EXISTS prospect_referrals_status_check;
ALTER TABLE prospect_referrals ADD CONSTRAINT prospect_referrals_status_check CHECK (status IN ('New', 'Contacted', 'Closed'));

CREATE INDEX IF NOT EXISTS prospect_referrals_submitted_at_idx ON prospect_referrals (submitted_at DESC);