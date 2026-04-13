-- User-defined content pillars (replaces hardcoded CONTENT_PILLARS).
-- The wizard creates 3-5 pillars; each has a label, description, funnel role, and color.

CREATE TABLE IF NOT EXISTS content_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  short_label TEXT NOT NULL,
  description TEXT NOT NULL,
  funnel_role TEXT NOT NULL,
  color_class TEXT NOT NULL DEFAULT 'bg-clay/15 text-clay',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE content_pillars ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER content_pillars_updated_at
  BEFORE UPDATE ON content_pillars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed with Adam's existing pillars so nothing breaks
INSERT INTO content_pillars (slug, label, short_label, description, funnel_role, color_class, sort_order) VALUES
  ('calm_tech', 'Calm Tech vs. The Attention Economy', 'Calm Tech', 'Tech should solve a problem and get out of the way. The attention economy is a design choice, not an inevitability.', 'TOFU primary', 'bg-moss/15 text-moss', 0),
  ('adhd_operator', 'Systems Over Willpower: The ADHD Operator', 'ADHD Operator', 'Build systems that work with the brain you actually have. Executive function scaffolding, not productivity theater.', 'TOFU + MOFU split', 'bg-clay/15 text-clay', 1),
  ('ai_for_operators', 'AI That Serves the Operator', 'AI for Ops', 'Practical AI adoption. Workflow first, tool second. Reduce cognitive load without surrendering sovereignty.', 'MOFU primary', 'bg-ink/10 text-ink', 2),
  ('own_your_stack', 'Own Your Stack, Own Your Future', 'Own Your Stack', 'Data sovereignty, open standards, and building things that last. Dependency without an exit is a business risk.', 'MOFU to BOFU bridge', 'bg-terracotta/15 text-terracotta', 3),
  ('cost_of_the_mask', 'The Cost of the Mask', 'The Mask', 'Burnout, masking, and rebuilding. The human under the operator.', 'TOFU + stealth BOFU', 'bg-clay-muted/20 text-clay', 4)
ON CONFLICT (slug) DO NOTHING;

-- Change content_posts.content_pillar from enum-like to free text
-- (it already is TEXT in the DB, just typed strictly in code)
