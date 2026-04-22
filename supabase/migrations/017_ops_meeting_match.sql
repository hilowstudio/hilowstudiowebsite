-- Per-client match rules for meeting ingestion.
-- A Fireflies (or Fathom) account is workspace-wide. To route meetings to the
-- correct client, match on title keywords or participant email/domain.

ALTER TABLE ops_clients
  ADD COLUMN IF NOT EXISTS title_keywords TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS participant_emails TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS participant_domains TEXT[] NOT NULL DEFAULT '{}';

-- Track how a meeting matched so the operator can audit auto-routing.
ALTER TABLE ops_meetings
  ADD COLUMN IF NOT EXISTS match_reason TEXT;
