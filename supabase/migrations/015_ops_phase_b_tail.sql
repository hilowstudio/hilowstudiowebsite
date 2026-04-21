-- Relax content_pillars.slug uniqueness so it's scoped per-client.
-- Old schema had slug globally unique, which breaks multi-tenant seeding.

ALTER TABLE content_pillars DROP CONSTRAINT IF EXISTS content_pillars_slug_key;
DROP INDEX IF EXISTS content_pillars_slug_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_content_pillars_client_slug
  ON content_pillars (client_id, slug)
  WHERE client_id IS NOT NULL;

-- Ensure Adam's legacy rows (with client_id = personal client) keep their
-- existing global slug as a functional unique fallback.
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_pillars_legacy_slug
  ON content_pillars (slug)
  WHERE client_id IS NULL;
