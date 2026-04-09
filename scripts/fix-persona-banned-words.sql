-- Remove banned words from the Calm Integrator persona body in voice_guide.
-- "navigated" and "leverage" both appear in BANNED_WORDS but the persona
-- text itself was using them. Internal contradiction, fixed.
--
-- Idempotent: exact-substring replace(), re-running is a no-op.

UPDATE voice_guide
SET content = replace(
  replace(
    content,
    'having navigated the devastating crucible of severe burnout',
    'having lived through the devastating crucible of severe burnout'
  ),
  'help people leverage their strengths and build scaffolding for their limits',
  'help people build on their strengths and scaffold their limits'
)
WHERE category = 'principle';
