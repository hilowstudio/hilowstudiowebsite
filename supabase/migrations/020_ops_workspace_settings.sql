-- Workspace-scoped key/value settings for workspace-level content tooling.
-- Mirrors app_settings but keyed by (workspace_id, key) so each workspace
-- can have its own hook preferences, etc. /admin continues to use app_settings
-- unchanged.

CREATE TABLE IF NOT EXISTS ops_workspace_settings (
  workspace_id UUID NOT NULL REFERENCES ops_workspaces(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, key)
);

ALTER TABLE ops_workspace_settings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ops_workspace_settings_workspace
  ON ops_workspace_settings (workspace_id);
