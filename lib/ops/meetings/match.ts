export type MatchRules = {
  title_keywords: string[];
  participant_emails: string[];
  participant_domains: string[];
};

export type MatchCandidate = {
  title: string | null;
  participant_emails: string[];
};

export type MatchResult =
  | { matched: true; reason: string }
  | { matched: false };

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function stripAt(domain: string): string {
  const n = normalize(domain);
  return n.startsWith("@") ? n.slice(1) : n;
}

export function matchesClient(
  candidate: MatchCandidate,
  rules: MatchRules,
): MatchResult {
  const title = candidate.title ? normalize(candidate.title) : "";
  const participants = candidate.participant_emails
    .map(normalize)
    .filter(Boolean);

  for (const rawKw of rules.title_keywords) {
    const kw = normalize(rawKw);
    if (!kw || !title) continue;
    if (title.includes(kw)) {
      return { matched: true, reason: `title: "${rawKw}"` };
    }
  }

  for (const rawEmail of rules.participant_emails) {
    const email = normalize(rawEmail);
    if (!email) continue;
    if (participants.includes(email)) {
      return { matched: true, reason: `participant: ${rawEmail}` };
    }
  }

  for (const rawDomain of rules.participant_domains) {
    const domain = stripAt(rawDomain);
    if (!domain) continue;
    const needle = `@${domain}`;
    if (participants.some((p) => p.endsWith(needle))) {
      return { matched: true, reason: `domain: ${rawDomain}` };
    }
  }

  return { matched: false };
}

export function hasAnyRules(rules: MatchRules): boolean {
  return (
    rules.title_keywords.some(Boolean) ||
    rules.participant_emails.some(Boolean) ||
    rules.participant_domains.some(Boolean)
  );
}
