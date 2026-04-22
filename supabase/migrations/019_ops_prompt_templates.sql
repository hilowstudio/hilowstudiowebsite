-- Prompt Library: curated content templates. Platform-level rows
-- (workspace_id IS NULL) are shared with every workspace.
-- Workspace-level rows belong to one agency and can be added/edited by staff.

CREATE TABLE IF NOT EXISTS ops_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ops_workspaces(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  prompt_body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_ops_prompt_templates_workspace
  ON ops_prompt_templates (workspace_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_ops_prompt_templates_platform
  ON ops_prompt_templates (sort_order)
  WHERE workspace_id IS NULL;

ALTER TABLE ops_prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER ops_prompt_templates_updated_at
  BEFORE UPDATE ON ops_prompt_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Seed platform-level templates.
-- Every workspace sees these by default.
-- ============================================
INSERT INTO ops_prompt_templates (workspace_id, slug, label, description, prompt_body, category, sort_order)
VALUES
  (NULL, 'client-win', 'Client win story',
   'Recent engagement outcome, anonymized.',
   'Share a recent client success. Set up the before-state concretely. Describe the intervention in plain language. Name the measurable result. Close with one lesson that applies beyond this client. Keep it tight; avoid buzzwords. No hedging.',
   'story', 0),
  (NULL, 'hot-take', 'Sharp hot take',
   'Opinionated post with a clear thesis.',
   'Give a sharp, defensible opinion. One clear thesis in the opening line. Two or three anchor points that back it. Skip the hedge. Write like someone who has been in the work for a decade, not like a LinkedIn influencer.',
   'opinion', 1),
  (NULL, 'tactical-howto', 'Tactical how-to',
   'Three-step walkthrough of a specific problem.',
   'Walk through how to solve a specific problem. Three concrete steps, one gotcha worth naming, one result the reader can expect. Short sentences. Specific nouns. No "introduction, body, conclusion" structure.',
   'tactical', 2),
  (NULL, 'industry-take', 'Industry commentary',
   'Response to recent news or trend.',
   'Comment on a recent industry development. Why it actually matters to operators, not pundits. Where the consensus take is thin. One call-out for what to do about it.',
   'opinion', 3),
  (NULL, 'behind-the-scenes', 'Behind the curtain',
   'Messy process made visible.',
   'Pull back the curtain on a messy or complicated internal process. What makes it hard. What you tried that failed. What finally worked. Leave the reader with a mental model they can use tomorrow.',
   'story', 4),
  (NULL, 'testimonial-story', 'Testimonial framed as story',
   'Surround a client quote with narrative.',
   'Frame a real client quote as a short story. Set up the context in two sentences. Lead with the quote. Explain why that outcome matters in operator terms. No corporate case-study voice; this should read like a conversation.',
   'story', 5),
  (NULL, 'minority-take', 'Principled minority position',
   'Argue a contrarian view with respect for the majority.',
   'Make the case for a minority position on a commonly-accepted practice. Acknowledge why the common view exists. Then argue clearly why it is incomplete, using specifics. End with what you actually do instead.',
   'opinion', 6),
  (NULL, 'lessons-from-failure', 'Lessons from a failure',
   'Concrete mistake + what changed.',
   'Share a mistake you actually made in the work. What happened. What you missed at the time. What changed in your approach afterward. Be specific; avoid "always be learning" platitudes.',
   'story', 7),
  (NULL, 'new-offering', 'New service announcement',
   'Frame a new offering.',
   'Announce a new service or offering. Who it is for. The specific pain it solves. Why you are the right one to offer it. Close with a clear next step for the reader. No launch-hype language.',
   'announcement', 8),
  (NULL, 'hiring-update', 'Key hire announcement',
   'Welcome a team member.',
   'Announce a key hire. Who they are in one sentence. Why this matters for the work. What changes for the team or clients because they are here. One sentence of genuine welcome.',
   'announcement', 9)
ON CONFLICT (workspace_id, slug) DO NOTHING;
