import type { HookType, FunnelStage, IdeaSource, VoiceCategory, ContentPillar } from "@/lib/types/database";

export const HOOK_TYPES: { value: HookType; label: string; description: string }[] = [
  { value: "contrarian", label: "Contrarian", description: "Challenge conventional wisdom" },
  { value: "story", label: "Story", description: "Personal narrative or anecdote" },
  { value: "stat", label: "Stat / Data", description: "Lead with a surprising number" },
  { value: "question", label: "Question", description: "Provocative question to the reader" },
  { value: "how_to", label: "How-To", description: "Step-by-step tactical advice" },
  { value: "listicle", label: "Listicle", description: "Numbered value items" },
  { value: "framework", label: "Framework", description: "Introduce a mental model" },
  { value: "vulnerable", label: "Vulnerable", description: "Honest, raw reflection" },
];

export const FUNNEL_STAGES: { value: FunnelStage; label: string; description: string; colorClass: string }[] = [
  {
    value: "tofu",
    label: "TOFU",
    description: "Top of funnel — broad reach, awareness, thought leadership",
    colorClass: "bg-clay-muted/20 text-clay",
  },
  {
    value: "mofu",
    label: "MOFU",
    description: "Middle of funnel — problem-aware, builds trust, shows methodology",
    colorClass: "bg-moss/20 text-moss",
  },
  {
    value: "bofu",
    label: "BOFU",
    description: "Bottom of funnel — solution-aware, case studies, direct offers",
    colorClass: "bg-ink/10 text-ink",
  },
];

export const FLYWHEEL_TARGET = { tofu: 4, mofu: 2, bofu: 1 } as const;

export const IDEA_SOURCES: { value: IdeaSource; label: string }[] = [
  { value: "call_notes", label: "Call Notes" },
  { value: "market_observation", label: "Market Observation" },
  { value: "competitor", label: "Competitor" },
  { value: "personal", label: "Personal Insight" },
  { value: "client_feedback", label: "Client Feedback" },
];

export const VOICE_CATEGORIES: { value: VoiceCategory; label: string }[] = [
  { value: "principle", label: "Guiding Principle" },
  { value: "do", label: "Do This" },
  { value: "dont", label: "Avoid This" },
  { value: "reference_post", label: "Reference Post" },
];

export const CONTENT_PILLARS: {
  value: ContentPillar;
  label: string;
  shortLabel: string;
  description: string;
  funnelRole: string;
  colorClass: string;
}[] = [
  {
    value: "calm_tech",
    label: "Calm Tech vs. The Attention Economy",
    shortLabel: "Calm Tech",
    description: "Tech should solve a problem and get out of the way. The attention economy is a design choice, not an inevitability.",
    funnelRole: "TOFU primary",
    colorClass: "bg-moss/15 text-moss",
  },
  {
    value: "adhd_operator",
    label: "Systems Over Willpower — The ADHD Operator",
    shortLabel: "ADHD Operator",
    description: "Build systems that work with the brain you actually have. Executive function scaffolding, not productivity theater.",
    funnelRole: "TOFU + MOFU split",
    colorClass: "bg-clay/15 text-clay",
  },
  {
    value: "ai_for_operators",
    label: "AI That Serves the Operator",
    shortLabel: "AI for Ops",
    description: "Practical AI adoption. Workflow first, tool second. Reduce cognitive load without surrendering sovereignty.",
    funnelRole: "MOFU primary",
    colorClass: "bg-ink/10 text-ink",
  },
  {
    value: "own_your_stack",
    label: "Own Your Stack, Own Your Future",
    shortLabel: "Own Your Stack",
    description: "Data sovereignty, open standards, and building things that last. Dependency without an exit is a business risk.",
    funnelRole: "MOFU → BOFU bridge",
    colorClass: "bg-terracotta/15 text-terracotta",
  },
  {
    value: "cost_of_the_mask",
    label: "The Cost of the Mask",
    shortLabel: "The Mask",
    description: "Burnout, masking, and rebuilding. The human under the operator.",
    funnelRole: "TOFU + stealth BOFU",
    colorClass: "bg-clay-muted/20 text-clay",
  },
];

/** Return ISO week number and year for a date */
export function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

/** Get monday of the given ISO week */
export function getWeekStart(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const mondayOfWeek1 = new Date(jan4.getTime() - (dayOfWeek - 1) * 86400000);
  return new Date(mondayOfWeek1.getTime() + (week - 1) * 7 * 86400000);
}

/** Get all 7 day dates for a given ISO week */
export function getWeekDays(year: number, week: number): Date[] {
  const monday = getWeekStart(year, week);
  return Array.from({ length: 7 }, (_, i) =>
    new Date(monday.getTime() + i * 86400000)
  );
}
