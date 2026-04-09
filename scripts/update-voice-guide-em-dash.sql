-- Append a punctuation discipline section to the voice_guide principle row
-- that bans em dashes. Appends rather than rewrites so existing content stays intact.

UPDATE voice_guide
SET content = content || E'\n\n**6. Punctuation Discipline**\n* **Never use em dashes (the — character) at all.** Use a period, comma, colon, or parentheses instead. Break long sentences into shorter ones. Em dashes are a signature AI-writing tell; their presence flags the output as machine-written. This rule is absolute. Do not use em dashes even to set off a phrase, even inside a list, even if the rest of the voice guide happens to contain them.'
WHERE category = 'principle'
  AND content NOT LIKE '%Punctuation Discipline%';
