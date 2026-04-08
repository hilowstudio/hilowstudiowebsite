-- LinkedIn OAuth Connection Storage
-- Run this in the Supabase SQL Editor or via `supabase db push`

CREATE TABLE linkedin_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_urn TEXT NOT NULL,
  name TEXT,
  email TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enforce singleton: only one active connection at a time
CREATE UNIQUE INDEX idx_linkedin_single_active
  ON linkedin_connections (status) WHERE status = 'active';

CREATE INDEX idx_linkedin_status ON linkedin_connections (status);

ALTER TABLE linkedin_connections ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER linkedin_connections_updated_at
  BEFORE UPDATE ON linkedin_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
