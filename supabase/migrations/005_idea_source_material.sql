-- Extend content_ideas with optional source material attachments
-- source_url: a URL for Claude to web_fetch during generation
-- source_material: pasted text (quote, book ref, article excerpt, podcatch summary)

ALTER TABLE content_ideas ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE content_ideas ADD COLUMN IF NOT EXISTS source_material TEXT;
