-- Studio: personal project management for Adam
-- See C:\Users\adam\.claude\plans\i-hate-clickup-as-starry-bear.md

-- ============================================
-- CLIENTS
-- ============================================
CREATE TABLE studio_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  billing_address TEXT,
  default_rate_cents INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_studio_clients_name ON studio_clients (name);

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE studio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES studio_clients(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  rate_cents INT,
  public_status_enabled BOOLEAN NOT NULL DEFAULT false,
  last_movement_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_studio_projects_client ON studio_projects (client_id);
CREATE INDEX idx_studio_projects_active ON studio_projects (status, last_movement_at DESC);
CREATE UNIQUE INDEX idx_studio_projects_slug ON studio_projects (slug);

-- ============================================
-- PHASES
-- ============================================
CREATE TABLE studio_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES studio_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  is_current BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_studio_phases_project ON studio_phases (project_id, position);

-- ============================================
-- DELIVERABLES
-- ============================================
CREATE TABLE studio_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL REFERENCES studio_phases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  position INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_studio_deliverables_phase ON studio_deliverables (phase_id, position);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE studio_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES studio_projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES studio_phases(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  next_up BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_studio_tasks_project ON studio_tasks (project_id, done);
CREATE INDEX idx_studio_tasks_next_up ON studio_tasks (next_up) WHERE next_up;

-- ============================================
-- NOTES
-- ============================================
CREATE TABLE studio_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES studio_projects(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_studio_notes_project ON studio_notes (project_id, created_at DESC);

-- ============================================
-- INBOX (quick-capture, unassigned)
-- ============================================
CREATE TABLE studio_inbox_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body TEXT NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_studio_inbox_unprocessed ON studio_inbox_items (processed, created_at DESC);

-- ============================================
-- TIME ENTRIES
-- ============================================
CREATE TABLE studio_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES studio_projects(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  description TEXT,
  rate_cents INT,
  invoiced_id UUID
);

CREATE INDEX idx_studio_time_entries_project ON studio_time_entries (project_id, started_at DESC);
CREATE INDEX idx_studio_time_entries_running ON studio_time_entries (ended_at) WHERE ended_at IS NULL;

-- ============================================
-- INVOICES (state-only tracker)
-- ============================================
CREATE TABLE studio_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES studio_projects(id) ON DELETE CASCADE,
  number TEXT,
  amount_cents INT NOT NULL,
  state TEXT NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  due_at DATE,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_studio_invoices_project ON studio_invoices (project_id);
CREATE INDEX idx_studio_invoices_state ON studio_invoices (state);

-- ============================================
-- CLIENT UPDATES (AI-drafted, manual send)
-- ============================================
CREATE TABLE studio_client_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES studio_projects(id) ON DELETE CASCADE,
  draft_body TEXT NOT NULL,
  final_body TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'manual'
);

CREATE INDEX idx_studio_client_updates_project ON studio_client_updates (project_id, generated_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- Service role bypasses RLS. Locks out anon key.
-- ============================================
ALTER TABLE studio_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_inbox_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_client_updates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- updated_at triggers (reuse existing function from 001)
-- ============================================
CREATE TRIGGER studio_clients_updated_at
  BEFORE UPDATE ON studio_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER studio_projects_updated_at
  BEFORE UPDATE ON studio_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- last_movement_at bump
-- Any insert/update on child tables refreshes the project's
-- last_movement_at so the Home screen stays cheap to sort.
-- ============================================
CREATE OR REPLACE FUNCTION bump_studio_project_movement()
RETURNS TRIGGER AS $$
DECLARE
  target_project_id UUID;
BEGIN
  IF TG_TABLE_NAME = 'studio_deliverables' THEN
    SELECT project_id INTO target_project_id
      FROM studio_phases
      WHERE id = COALESCE(NEW.phase_id, OLD.phase_id);
  ELSE
    target_project_id := COALESCE(NEW.project_id, OLD.project_id);
  END IF;

  IF target_project_id IS NOT NULL THEN
    UPDATE studio_projects
      SET last_movement_at = now()
      WHERE id = target_project_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER studio_tasks_bump_movement
  AFTER INSERT OR UPDATE ON studio_tasks
  FOR EACH ROW EXECUTE FUNCTION bump_studio_project_movement();

CREATE TRIGGER studio_notes_bump_movement
  AFTER INSERT OR UPDATE ON studio_notes
  FOR EACH ROW EXECUTE FUNCTION bump_studio_project_movement();

CREATE TRIGGER studio_deliverables_bump_movement
  AFTER INSERT OR UPDATE ON studio_deliverables
  FOR EACH ROW EXECUTE FUNCTION bump_studio_project_movement();

CREATE TRIGGER studio_time_entries_bump_movement
  AFTER INSERT OR UPDATE ON studio_time_entries
  FOR EACH ROW EXECUTE FUNCTION bump_studio_project_movement();

CREATE TRIGGER studio_client_updates_bump_movement
  AFTER INSERT OR UPDATE ON studio_client_updates
  FOR EACH ROW EXECUTE FUNCTION bump_studio_project_movement();
