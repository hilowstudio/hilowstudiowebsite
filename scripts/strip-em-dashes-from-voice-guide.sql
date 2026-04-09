-- Strip the three em dashes from the Calm Integrator persona body in voice_guide.
-- Does NOT touch the em dashes that appear inside the Punctuation Discipline rule
-- itself, because those refer to the character and must remain.
--
-- Idempotent: replaces exact source substrings, so re-running is a no-op.

UPDATE voice_guide
SET content = replace(
  replace(
    replace(
      content,
      'you construct—whether technical, operational, or human—as a profound act of care',
      'you construct, whether technical, operational, or human, as a profound act of care'
    ),
    'unconditional positive regard—recognizing the deep fragility',
    'unconditional positive regard. You recognize the deep fragility'
  ),
  'ethical imperative—a boundary designed to protect human dignity',
  'ethical imperative. It is a boundary designed to protect human dignity'
)
WHERE category = 'principle';
