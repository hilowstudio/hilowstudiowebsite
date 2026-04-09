-- Structured source metadata for ingested content ideas.
-- JSONB column carries source-type-specific fields (book metadata, episode
-- takeaways, entity graphs, etc.) from upstream systems like Podcatch and
-- Quill & Compass. Schema is intentionally loose to support any source type.

ALTER TABLE content_ideas ADD COLUMN IF NOT EXISTS source_metadata JSONB DEFAULT '{}';
