-- Purely additive. No schema change required — `ops_settings.key` is a free
-- TEXT column and the app layer validates `SettingKey`. This migration exists
-- as a marker that `openai_api_key` and `gemini_api_key` are now supported
-- setting keys.
--
-- Safe to apply. No destructive ops. No data migration.

-- No-op: confirm ops_settings has the (scope, scope_id, key) unique index
-- required by the upsert pattern in lib/ops/settings.ts.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'ops_settings'
      AND indexname = 'ops_settings_scope_scope_id_key_key'
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS ops_settings_scope_scope_id_key_key
      ON ops_settings (scope, COALESCE(scope_id::text, ''), key);
  END IF;
END $$;
