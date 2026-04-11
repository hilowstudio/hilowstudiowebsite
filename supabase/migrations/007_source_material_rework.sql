-- Rework content_ideas for the Source Material model.
-- Status changes from captured/promoted/discarded to active/hidden.
-- Add use_count to track how many times a source has been used for content.

-- Add use_count column
ALTER TABLE content_ideas ADD COLUMN IF NOT EXISTS use_count INT NOT NULL DEFAULT 0;

-- Migrate existing statuses to new model
UPDATE content_ideas SET status = 'active' WHERE status IN ('captured', 'developing', 'promoted');
UPDATE content_ideas SET status = 'hidden' WHERE status = 'discarded';
