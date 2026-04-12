-- Add contrastive framing ban to voice_guide principle row.
-- Replaces section 6 placeholder and renumbers Punctuation to section 7.
-- Idempotent: only runs if the rule isn't already present.

UPDATE voice_guide
SET content = replace(
  content,
  '**6. Punctuation Discipline**',
  E'**6. No Contrastive Framing (The "Not X, It''s Y" Ban)**\nThis is one of the most pervasive AI-writing patterns and it must be eliminated completely. The pattern works by denying one frame, then asserting the "real" frame. It creates the illusion of insight without adding substance. The denial half is always filler.\n\n**All of the following structures are banned:**\n* "It''s not X, it''s Y" / "This isn''t X, it''s Y"\n* "Not X. The Y." / "Not X, but Y." / "Not just X, but Y."\n* "X isn''t the problem. Y is." / "The risk isn''t X. It''s Y."\n* "That''s not X. That''s Y." / "That''s not X. It''s Y."\n* "You don''t get X. You get Y."\n* "X? No. Y." / "Less X, more Y."\n* Title-level negation that implies its opposite (e.g., "Friction Isn''t a Bug" implies "it''s a feature")\n\n**The fix is simple: just say what the thing is.** Drop the denial entirely. If your claim is strong, it doesn''t need a straw man to knock down first.\n\nExamples of what to do instead:\n* BAD: "AI''s real danger isn''t your job. It''s convincing you that what it offers is connection."\n* GOOD: "AI''s real danger is convincing you that what it offers is connection."\n* BAD: "That''s not a feature request. It''s an ethical constraint."\n* GOOD: "That''s an ethical constraint built into the architecture."\n* BAD: "The risk isn''t preference. It''s atrophy."\n* GOOD: "The risk is atrophy."\n\nEvery time you feel the urge to say "not X," ask: does the reader need to hear what it''s not? Almost always, no. Just say what it is.\n\n**7. Punctuation Discipline**'
)
WHERE category = 'principle'
  AND content NOT LIKE '%Contrastive Framing%';
