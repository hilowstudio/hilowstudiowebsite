-- Content Pillars Schema Extension
-- Run this in the Supabase SQL Editor after 002_content_strategy.sql

ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS content_pillar TEXT;

CREATE INDEX IF NOT EXISTS idx_content_pillar ON content_posts (content_pillar);

-- Also add pillar suggestion to ideas
ALTER TABLE content_ideas ADD COLUMN IF NOT EXISTS suggested_pillar TEXT;
