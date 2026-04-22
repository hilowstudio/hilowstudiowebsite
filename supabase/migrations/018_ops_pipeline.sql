-- Phase restructure: lift network intelligence from client-scope to
-- workspace-scope, add leads + outreach timeline for pre-client pipeline.
-- Schema-destructive note: we RELAX nullability on client_id for the network
-- tables (no column is dropped). Existing rows keep their client_id; new
-- workspace-scoped rows can leave it null.

-- ============================================
-- Network contacts: add workspace_id, make client_id optional
-- ============================================
ALTER TABLE ops_network_contacts
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES ops_workspaces(id) ON DELETE CASCADE;

ALTER TABLE ops_network_contacts
  ALTER COLUMN client_id DROP NOT NULL;

UPDATE ops_network_contacts nc
  SET workspace_id = c.workspace_id
  FROM ops_clients c
  WHERE nc.client_id = c.id
    AND nc.workspace_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_ops_network_contacts_workspace
  ON ops_network_contacts (workspace_id);

-- ============================================
-- Engagement events: same expansion
-- ============================================
ALTER TABLE ops_engagement_events
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES ops_workspaces(id) ON DELETE CASCADE;

ALTER TABLE ops_engagement_events
  ALTER COLUMN client_id DROP NOT NULL;

UPDATE ops_engagement_events ee
  SET workspace_id = c.workspace_id
  FROM ops_clients c
  WHERE ee.client_id = c.id
    AND ee.workspace_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_ops_engagement_events_workspace
  ON ops_engagement_events (workspace_id, observed_at DESC);

-- ============================================
-- Competitors: same expansion (workspace-level watchlist)
-- ============================================
ALTER TABLE ops_competitors
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES ops_workspaces(id) ON DELETE CASCADE;

ALTER TABLE ops_competitors
  ALTER COLUMN client_id DROP NOT NULL;

UPDATE ops_competitors co
  SET workspace_id = c.workspace_id
  FROM ops_clients c
  WHERE co.client_id = c.id
    AND co.workspace_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_ops_competitors_workspace
  ON ops_competitors (workspace_id);

-- ============================================
-- Warm prospects: same expansion
-- ============================================
ALTER TABLE ops_warm_prospects
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES ops_workspaces(id) ON DELETE CASCADE;

ALTER TABLE ops_warm_prospects
  ALTER COLUMN client_id DROP NOT NULL;

UPDATE ops_warm_prospects wp
  SET workspace_id = c.workspace_id
  FROM ops_clients c
  WHERE wp.client_id = c.id
    AND wp.workspace_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_ops_warm_prospects_workspace
  ON ops_warm_prospects (workspace_id, score DESC)
  WHERE dismissed_at IS NULL;

-- ============================================
-- LEADS (pre-client pipeline)
-- ============================================
CREATE TABLE IF NOT EXISTS ops_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES ops_workspaces(id) ON DELETE CASCADE,
  network_contact_id UUID REFERENCES ops_network_contacts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  linkedin_url TEXT,
  source TEXT,                 -- warm_prospect | inbound | referral | manual | event
  status TEXT NOT NULL DEFAULT 'prospect',
                               -- prospect | courting | meeting_scheduled | converted | lost | paused
  notes TEXT,
  last_touch_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  converted_client_id UUID REFERENCES ops_clients(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ops_leads_workspace
  ON ops_leads (workspace_id, status, last_touch_at DESC);

CREATE INDEX IF NOT EXISTS idx_ops_leads_follow_up
  ON ops_leads (workspace_id, next_follow_up_at)
  WHERE next_follow_up_at IS NOT NULL AND status NOT IN ('converted', 'lost');

ALTER TABLE ops_leads ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER ops_leads_updated_at
  BEFORE UPDATE ON ops_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- OUTREACH timeline (polymorphic touches)
-- Can attach to a lead, client, or just a network contact.
-- ============================================
CREATE TABLE IF NOT EXISTS ops_outreach (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES ops_workspaces(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES ops_leads(id) ON DELETE CASCADE,
  client_id UUID REFERENCES ops_clients(id) ON DELETE CASCADE,
  network_contact_id UUID REFERENCES ops_network_contacts(id) ON DELETE SET NULL,
  kind TEXT NOT NULL,
    -- sent_dm | sent_inmail | sent_email | received_reply | event_met |
    -- engaged_on_their_post | commented_on_their_post | phone_call |
    -- note | other
  direction TEXT NOT NULL DEFAULT 'outbound',  -- outbound | inbound
  subject TEXT,
  body TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  scheduled_for TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  follow_up_at TIMESTAMPTZ,
  created_by_user_id UUID REFERENCES ops_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ops_outreach_lead
  ON ops_outreach (lead_id, completed_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_ops_outreach_workspace_followup
  ON ops_outreach (workspace_id, follow_up_at)
  WHERE follow_up_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ops_outreach_contact
  ON ops_outreach (network_contact_id)
  WHERE network_contact_id IS NOT NULL;

ALTER TABLE ops_outreach ENABLE ROW LEVEL SECURITY;

-- ============================================
-- OUTREACH DRAFTS (AI-generated awaiting approval)
-- ============================================
CREATE TABLE IF NOT EXISTS ops_outreach_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES ops_workspaces(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES ops_leads(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  draft_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',  -- draft | approved | sent | dismissed
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_as_outreach_id UUID REFERENCES ops_outreach(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ops_outreach_drafts_lead
  ON ops_outreach_drafts (lead_id, generated_at DESC)
  WHERE lead_id IS NOT NULL;

ALTER TABLE ops_outreach_drafts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Trigger: whenever an outreach row is completed or created, bump
-- ops_leads.last_touch_at and surface the follow-up date.
-- ============================================
CREATE OR REPLACE FUNCTION bump_ops_lead_touch()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lead_id IS NOT NULL THEN
    UPDATE ops_leads
      SET last_touch_at = COALESCE(NEW.completed_at, now()),
          next_follow_up_at = NEW.follow_up_at,
          updated_at = now()
      WHERE id = NEW.lead_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ops_outreach_bump_lead_touch
  AFTER INSERT OR UPDATE ON ops_outreach
  FOR EACH ROW EXECUTE FUNCTION bump_ops_lead_touch();
