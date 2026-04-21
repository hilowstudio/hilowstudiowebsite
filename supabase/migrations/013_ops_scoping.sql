-- Hi Low Ops: scope existing LCM tables to workspace + client.
-- Strategy: add nullable workspace_id / client_id, create Adam's default
-- workspace + client, backfill existing rows. Columns stay nullable in
-- Phase A so /admin (Adam's legacy surface) keeps working unchanged.

-- ============================================
-- Create Adam's default workspace + client
-- ============================================
INSERT INTO ops_workspaces (slug, name, brand_name, plan)
VALUES ('adam', 'Adam Vega', 'Hi Low Studio', 'founder')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO ops_clients (workspace_id, slug, name, company, status)
SELECT id, 'personal', 'Personal', 'Hi Low Studio', 'active'
FROM ops_workspaces WHERE slug = 'adam'
ON CONFLICT (workspace_id, slug) DO NOTHING;

-- ============================================
-- Add workspace_id + client_id to content tables
-- ============================================
ALTER TABLE content_posts
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES ops_workspaces(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES ops_clients(id) ON DELETE SET NULL;

ALTER TABLE content_ideas
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES ops_workspaces(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES ops_clients(id) ON DELETE SET NULL;

ALTER TABLE voice_guide
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES ops_workspaces(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES ops_clients(id) ON DELETE SET NULL;

ALTER TABLE content_pillars
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES ops_workspaces(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES ops_clients(id) ON DELETE SET NULL;

ALTER TABLE linkedin_connections
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES ops_workspaces(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES ops_clients(id) ON DELETE SET NULL;

-- ============================================
-- Add workspace_id to CRM tables (workspace-scoped, not client-scoped)
-- ============================================
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES ops_workspaces(id) ON DELETE SET NULL;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES ops_workspaces(id) ON DELETE SET NULL;

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES ops_workspaces(id) ON DELETE SET NULL;

-- ============================================
-- Backfill: point everything at Adam's workspace + personal client
-- ============================================
DO $$
DECLARE
  v_workspace UUID;
  v_client UUID;
BEGIN
  SELECT id INTO v_workspace FROM ops_workspaces WHERE slug = 'adam' LIMIT 1;
  SELECT id INTO v_client FROM ops_clients WHERE workspace_id = v_workspace AND slug = 'personal' LIMIT 1;

  IF v_workspace IS NULL OR v_client IS NULL THEN
    RAISE EXCEPTION 'Default workspace or client missing; cannot backfill';
  END IF;

  UPDATE content_posts SET workspace_id = v_workspace, client_id = v_client
    WHERE workspace_id IS NULL;
  UPDATE content_ideas SET workspace_id = v_workspace, client_id = v_client
    WHERE workspace_id IS NULL;
  UPDATE voice_guide SET workspace_id = v_workspace, client_id = v_client
    WHERE workspace_id IS NULL;
  UPDATE content_pillars SET workspace_id = v_workspace, client_id = v_client
    WHERE workspace_id IS NULL;
  UPDATE linkedin_connections SET workspace_id = v_workspace, client_id = v_client
    WHERE workspace_id IS NULL;

  UPDATE contacts SET workspace_id = v_workspace WHERE workspace_id IS NULL;
  UPDATE bookings SET workspace_id = v_workspace WHERE workspace_id IS NULL;
  UPDATE activities SET workspace_id = v_workspace WHERE workspace_id IS NULL;
END $$;

-- ============================================
-- Indexes for workspace/client-scoped lookups
-- ============================================
CREATE INDEX IF NOT EXISTS idx_content_posts_client ON content_posts (client_id, status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_content_ideas_client ON content_ideas (client_id, status);
CREATE INDEX IF NOT EXISTS idx_voice_guide_client ON voice_guide (client_id, category);
CREATE INDEX IF NOT EXISTS idx_content_pillars_client ON content_pillars (client_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_connections_client ON linkedin_connections (client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_workspace ON contacts (workspace_id, stage);
CREATE INDEX IF NOT EXISTS idx_bookings_workspace ON bookings (workspace_id, start_time);
CREATE INDEX IF NOT EXISTS idx_activities_workspace ON activities (workspace_id, created_at DESC);
