-- Hi Low Ops: multi-tenant agency ops SaaS (Gia competitor for MT white-label)
-- See C:\Users\adam\.claude\plans\i-hate-clickup-as-starry-bear.md

-- ============================================
-- USERS (shared across workspaces + clients)
-- ============================================
CREATE TABLE ops_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ops_users_email ON ops_users (email);

-- ============================================
-- WORKSPACES (agencies)
-- ============================================
CREATE TABLE ops_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand_name TEXT,
  logo_url TEXT,
  primary_color TEXT,
  custom_domain TEXT UNIQUE,
  billing_email TEXT,
  plan TEXT NOT NULL DEFAULT 'starter',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ops_workspaces_slug ON ops_workspaces (slug);

CREATE TABLE ops_workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES ops_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES ops_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff', -- owner | staff
  invited_by UUID REFERENCES ops_users(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

CREATE INDEX idx_ops_workspace_members_user ON ops_workspace_members (user_id);
CREATE INDEX idx_ops_workspace_members_workspace ON ops_workspace_members (workspace_id);

-- ============================================
-- CLIENTS (agencies' customers)
-- ============================================
CREATE TABLE ops_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES ops_workspaces(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  status TEXT NOT NULL DEFAULT 'active', -- active | paused | archived
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, slug)
);

CREATE INDEX idx_ops_clients_workspace ON ops_clients (workspace_id, status);

CREATE TABLE ops_client_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES ops_clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES ops_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'client_viewer', -- client_owner | client_contributor | client_viewer
  invited_by UUID REFERENCES ops_users(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, user_id)
);

CREATE INDEX idx_ops_client_members_user ON ops_client_members (user_id);
CREATE INDEX idx_ops_client_members_client ON ops_client_members (client_id);

-- ============================================
-- INVITES (pending workspace + client memberships)
-- ============================================
CREATE TABLE ops_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  scope TEXT NOT NULL, -- workspace | client
  scope_id UUID NOT NULL,
  role TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES ops_users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ops_invites_token ON ops_invites (token) WHERE accepted_at IS NULL;
CREATE INDEX idx_ops_invites_email ON ops_invites (email) WHERE accepted_at IS NULL;

-- ============================================
-- SETTINGS (per-scope encrypted config)
-- scope: platform | workspace | client
-- Resolution order: client -> workspace -> platform
-- ============================================
CREATE TABLE ops_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL, -- platform | workspace | client
  scope_id UUID,       -- null when scope = platform
  key TEXT NOT NULL,   -- e.g. anthropic_api_key, deepgram_api_key, fireflies_api_key
  encrypted_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (scope, scope_id, key)
);

CREATE INDEX idx_ops_settings_lookup ON ops_settings (scope, scope_id, key);

-- ============================================
-- USAGE METERS (per-client per-month counters)
-- Feeds the hybrid cost model: baseline quota then BYOK overflow
-- ============================================
CREATE TABLE ops_usage_meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES ops_clients(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- YYYY-MM
  meter TEXT NOT NULL,  -- llm_tokens | transcription_minutes | posts_published
  count BIGINT NOT NULL DEFAULT 0,
  cap BIGINT,
  byok_override BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, period, meter)
);

CREATE INDEX idx_ops_usage_meters_client ON ops_usage_meters (client_id, period);

-- ============================================
-- MEETINGS: sources + transcripts + insights
-- ============================================
CREATE TABLE ops_meeting_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES ops_clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- fireflies | fathom | granola | manual | zoom_bot
  config_encrypted TEXT, -- JSON blob of connector-specific tokens, encrypted
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ops_meeting_sources_client ON ops_meeting_sources (client_id, enabled);

CREATE TABLE ops_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES ops_clients(id) ON DELETE CASCADE,
  source_id UUID REFERENCES ops_meeting_sources(id) ON DELETE SET NULL,
  external_id TEXT NOT NULL,
  title TEXT,
  started_at TIMESTAMPTZ,
  duration_minutes INT,
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  transcript_url TEXT,
  transcript_text TEXT,
  audio_url TEXT,
  status TEXT NOT NULL DEFAULT 'ingesting', -- ingesting | ready | failed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, external_id)
);

CREATE INDEX idx_ops_meetings_client ON ops_meetings (client_id, started_at DESC);

CREATE TABLE ops_meeting_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES ops_meetings(id) ON DELETE CASCADE,
  kind TEXT NOT NULL, -- action_item | quote | brief | churn_signal | upsell_signal | referral_signal
  body TEXT NOT NULL,
  speaker TEXT,
  timestamp_seconds INT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  assigned_to_user_id UUID REFERENCES ops_users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open | done | dismissed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ops_meeting_insights_meeting ON ops_meeting_insights (meeting_id, kind);
CREATE INDEX idx_ops_meeting_insights_assignee ON ops_meeting_insights (assigned_to_user_id, status) WHERE assigned_to_user_id IS NOT NULL;

-- Links a meeting to a content_posts row once promoted into a post draft.
CREATE TABLE ops_meeting_post_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES ops_meetings(id) ON DELETE CASCADE,
  content_post_id UUID, -- soft FK; content_posts lives in legacy schema
  draft_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | promoted | dismissed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ops_meeting_post_drafts_meeting ON ops_meeting_post_drafts (meeting_id);

-- ============================================
-- NETWORK INTELLIGENCE (Phase C)
-- ============================================
CREATE TABLE ops_network_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES ops_clients(id) ON DELETE CASCADE,
  linkedin_urn TEXT,
  linkedin_url TEXT,
  name TEXT,
  company TEXT,
  headline TEXT,
  imported_via TEXT NOT NULL DEFAULT 'manual', -- csv_export | linkedin_api | manual
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ops_network_contacts_client ON ops_network_contacts (client_id);
CREATE INDEX idx_ops_network_contacts_urn ON ops_network_contacts (client_id, linkedin_urn) WHERE linkedin_urn IS NOT NULL;

CREATE TABLE ops_engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES ops_clients(id) ON DELETE CASCADE,
  network_contact_id UUID REFERENCES ops_network_contacts(id) ON DELETE SET NULL,
  post_id UUID, -- soft FK; nullable for competitor posts
  kind TEXT NOT NULL, -- like | comment | reshare
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_ops_engagement_events_client ON ops_engagement_events (client_id, observed_at DESC);
CREATE INDEX idx_ops_engagement_events_contact ON ops_engagement_events (network_contact_id) WHERE network_contact_id IS NOT NULL;

CREATE TABLE ops_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES ops_clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  linkedin_url TEXT,
  watch_profiles JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ops_competitors_client ON ops_competitors (client_id);

CREATE TABLE ops_warm_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES ops_clients(id) ON DELETE CASCADE,
  network_contact_id UUID NOT NULL REFERENCES ops_network_contacts(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL DEFAULT 0,
  reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  surfaced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  dismissed_at TIMESTAMPTZ,
  UNIQUE (client_id, network_contact_id)
);

CREATE INDEX idx_ops_warm_prospects_client ON ops_warm_prospects (client_id, surfaced_at DESC) WHERE dismissed_at IS NULL;

-- ============================================
-- COLLABORATION ON CONTENT
-- (content_post_id references the legacy content_posts table; soft FK)
-- ============================================
CREATE TABLE ops_content_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_post_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES ops_users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ops_content_comments_post ON ops_content_comments (content_post_id, created_at DESC);

CREATE TABLE ops_content_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_post_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES ops_users(id) ON DELETE CASCADE,
  state TEXT NOT NULL, -- requested | approved | changes_requested
  note TEXT,
  acted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ops_content_approvals_post ON ops_content_approvals (content_post_id, acted_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (service role bypasses)
-- ============================================
ALTER TABLE ops_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_client_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_usage_meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_meeting_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_meeting_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_meeting_post_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_network_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_warm_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_content_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_content_approvals ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Reuse existing update_updated_at() trigger function from migration 001
-- ============================================
CREATE TRIGGER ops_users_updated_at
  BEFORE UPDATE ON ops_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ops_workspaces_updated_at
  BEFORE UPDATE ON ops_workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ops_clients_updated_at
  BEFORE UPDATE ON ops_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ops_settings_updated_at
  BEFORE UPDATE ON ops_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ops_meetings_updated_at
  BEFORE UPDATE ON ops_meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
