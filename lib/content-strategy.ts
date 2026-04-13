import type { HookType, FunnelStage, IdeaSource, VoiceCategory, ContentPillar } from "@/lib/types/database";

export const HOOK_TYPES: {
  value: HookType;
  label: string;
  description: string;
  funnel: FunnelStage;
  humanOnly?: boolean;
}[] = [
  // ── ToFu: Awareness & Reach ──
  { value: "contrarian", label: "Contrarian", description: "Grabs attention by challenging norms and conventional wisdom.", funnel: "tofu" },
  { value: "data_backed", label: "Data-Backed", description: "Uses a surprising stat or data point to stop the scroll.", funnel: "tofu" },
  { value: "vulnerability_story", label: "Vulnerability / Story", description: "Builds immediate human connection through personal narrative.", funnel: "tofu", humanOnly: true },
  { value: "curiosity_gap", label: "Curiosity Gap", description: "Leverages human psychology to drive clicks and read-more expansions.", funnel: "tofu" },
  { value: "bold_claim", label: "Bold Claim", description: "Provokes intrigue and forces readers to see if you can defend your stance.", funnel: "tofu" },
  { value: "question", label: "Question", description: "Engages readers by instantly making them think about themselves.", funnel: "tofu" },
  { value: "myth_busting", label: "Myth-Busting", description: "Re-educates the market and positions you as a fresh voice.", funnel: "tofu" },
  { value: "tribal", label: "Us vs. Them (Tribal)", description: "Builds immediate community and loyalty by polarizing an audience.", funnel: "tofu" },
  { value: "paradox", label: "Paradox", description: "Creates cognitive dissonance that forces the scroll to stop.", funnel: "tofu" },
  { value: "quote_wisdom", label: "Quote / Wisdom", description: "Borrows authority from a recognized source to capture new readers.", funnel: "tofu" },
  { value: "name_drop", label: "Name-Drop", description: "Uses established, recognizable names to capture broad interest.", funnel: "tofu" },
  { value: "observation_trend", label: "Observation / Trend", description: "Appeals to the desire to stay updated and ahead of the curve.", funnel: "tofu" },
  { value: "empathy_validation", label: "Empathy / Validation", description: "Connects deeply by making the reader feel seen and understood.", funnel: "tofu" },
  { value: "david_goliath", label: "David vs. Goliath", description: "Tells an underdog story that is universally appealing.", funnel: "tofu" },
  { value: "hyperbolic", label: "Hyperbolic", description: "Uses extreme language strictly to command attention in a crowded feed.", funnel: "tofu" },

  // ── MoFu: Consideration & Authority ──
  { value: "warning_mistake", label: "Warning / Mistake", description: "Agitates a known problem for readers already aware of their pain points.", funnel: "mofu" },
  { value: "how_to", label: "Actionable How-To", description: "Delivers pure value, moving readers from awareness to seeing you as a resource.", funnel: "mofu" },
  { value: "number_list", label: "Number / List", description: "Promises structured, educational content that is easy to consume.", funnel: "mofu" },
  { value: "behind_scenes", label: "Behind the Scenes", description: "Deepens the relationship by showing the messy or unpolished reality.", funnel: "mofu", humanOnly: true },
  { value: "framework", label: "Framework / System", description: "Shifts you from a commentator to an expert by showcasing proprietary methods.", funnel: "mofu" },
  { value: "steal_my", label: '"Steal My..."', description: "Acts as a trust-building exercise by giving away high-value assets.", funnel: "mofu" },
  { value: "milestone_lesson", label: "Milestone / Lesson", description: "Nurtures the audience by showing your growth and sharing educational takeaways.", funnel: "mofu", humanOnly: true },
  { value: "what_if", label: '"What If" (Future-Pacing)', description: "Gets warm audiences to visualize a better state, moving them closer to a solution.", funnel: "mofu" },
  { value: "ultra_specific", label: "Ultra-Specific", description: "Filters out the broad audience to speak directly to your ideal reader.", funnel: "mofu" },
  { value: "proof_of_work", label: "Proof of Work", description: "Proves your dedication and research capabilities, cementing authority.", funnel: "mofu" },
  { value: "negative_command", label: "Negative Command", description: "Shows authoritative leadership by telling an audience exactly what to stop doing.", funnel: "mofu" },
  { value: "i_was_wrong", label: '"I Was Wrong"', description: "Builds deep trust through humility and self-awareness.", funnel: "mofu", humanOnly: true },
  { value: "secret_truth", label: "Secret / Hidden Truth", description: "Rewards your existing audience with insider knowledge.", funnel: "mofu" },
  { value: "letter_younger_self", label: "Letter to My Younger Self", description: "Builds mentorship-style authority by reflecting on the journey.", funnel: "mofu", humanOnly: true },

  // ── BoFu: Conversion & Decision ──
  { value: "transformation", label: "Transformation", description: "Shows a definitive before-and-after, providing ultimate proof your methods work.", funnel: "bofu" },
  { value: "case_study", label: "Case Study / Teardown", description: "Delivers hard evidence of success for high-intent prospects.", funnel: "bofu" },
  { value: "time_frame", label: "Time-Frame", description: "Injects urgency and efficiency to push hesitant prospects to take action.", funnel: "bofu" },
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
  { value: "personal", label: "Personal Insight" },
  { value: "call_notes", label: "Call Notes" },
  { value: "market_observation", label: "Market Observation" },
  { value: "competitor", label: "Competitor" },
  { value: "client_feedback", label: "Client Feedback" },
  { value: "book", label: "Book" },
  { value: "podcast", label: "Podcast" },
  { value: "youtube", label: "YouTube" },
  { value: "article", label: "Article" },
  { value: "repurpose", label: "Repurpose" },
  { value: "external", label: "External" },
];

export const REPURPOSE_THRESHOLDS = {
  min_impressions: 1000,
  min_engagement_rate: 0.03, // 3% (likes+comments+shares)/impressions
  min_age_days: 60,
} as const;

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
