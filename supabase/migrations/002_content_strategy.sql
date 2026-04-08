-- Content Strategy Automation Schema Extension
-- Run this in the Supabase SQL Editor

-- ============================================
-- EXTEND CONTENT_POSTS
-- ============================================
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS hook_type TEXT;
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS funnel_stage TEXT;
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS week_number INT;
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS visual_url TEXT;

CREATE INDEX IF NOT EXISTS idx_content_hook ON content_posts (hook_type);
CREATE INDEX IF NOT EXISTS idx_content_funnel ON content_posts (funnel_stage);
CREATE INDEX IF NOT EXISTS idx_content_week ON content_posts (week_number);

-- ============================================
-- CONTENT IDEAS (Insight Bank)
-- ============================================
CREATE TABLE content_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_insight TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'personal',
  suggested_hook TEXT,
  suggested_funnel TEXT,
  status TEXT NOT NULL DEFAULT 'captured',
  promoted_post_id UUID REFERENCES content_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ideas_status ON content_ideas (status);
CREATE INDEX idx_ideas_created ON content_ideas (created_at DESC);

ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER content_ideas_updated_at
  BEFORE UPDATE ON content_ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VOICE GUIDE (Tone & Style Reference)
-- ============================================
CREATE TABLE voice_guide (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'principle',
  content TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_voice_category ON voice_guide (category, sort_order);

ALTER TABLE voice_guide ENABLE ROW LEVEL SECURITY;
