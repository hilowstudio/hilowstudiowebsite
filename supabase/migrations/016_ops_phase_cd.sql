-- Hi Low Ops Phase C + D:
-- - Network intelligence indexes
-- - Expanded workspace brand fields
-- - Stripe subscriptions table

-- ============================================
-- Workspace brand expansion (Phase D white-label)
-- ============================================
ALTER TABLE ops_workspaces
  ADD COLUMN IF NOT EXISTS email_from_name TEXT,
  ADD COLUMN IF NOT EXISTS email_from_address TEXT,
  ADD COLUMN IF NOT EXISTS accent_color TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS domain_verified_at TIMESTAMPTZ;

-- ============================================
-- Network intelligence (Phase C)
-- ============================================
-- Relax unique_per_client on linkedin_urn so clients with null urns don't collide.
CREATE UNIQUE INDEX IF NOT EXISTS idx_ops_network_contacts_client_urn_unique
  ON ops_network_contacts (client_id, linkedin_urn)
  WHERE linkedin_urn IS NOT NULL;

-- Match engagement events back to LinkedIn URNs on the post side.
CREATE INDEX IF NOT EXISTS idx_ops_engagement_events_post
  ON ops_engagement_events (post_id)
  WHERE post_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ops_warm_prospects_score
  ON ops_warm_prospects (client_id, score DESC)
  WHERE dismissed_at IS NULL;

-- ============================================
-- Stripe subscriptions (Phase D)
-- One active row per workspace. Mirrors Stripe state via webhook.
-- ============================================
CREATE TABLE IF NOT EXISTS ops_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES ops_workspaces(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  plan_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'incomplete',
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_ops_subscriptions_workspace
  ON ops_subscriptions (workspace_id, status);

ALTER TABLE ops_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER ops_subscriptions_updated_at
  BEFORE UPDATE ON ops_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Seed 'free' plan for downgrades when subscription lapses
-- ============================================
INSERT INTO ops_plans (slug, name, llm_tokens_cap, transcription_minutes_cap, posts_published_cap, monthly_price_cents, notes)
VALUES ('free', 'Free tier', 50000, 30, 5, 0, 'Post-lapse fallback. Minimal caps; workspace prompted to resubscribe.')
ON CONFLICT (slug) DO NOTHING;
