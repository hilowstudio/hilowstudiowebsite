-- First-comment scheduling support.
-- Stores the comment text, delay, and whether it's been posted.

ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS first_comment TEXT;
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS first_comment_delay_minutes INT DEFAULT 2;
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS first_comment_posted BOOLEAN DEFAULT false;
