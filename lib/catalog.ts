// Hi-Low Studio productized services catalog
// Content-as-code: edit this file to add or change offerings.

export type CatalogCategory = "build" | "training" | "advisory" | "audit";

export type CatalogCTA =
  | { kind: "buy"; stripeUrl: string; ctaLabel?: string }
  | { kind: "inquire"; ctaLabel?: string };

export type CatalogBadge = "popular" | "new" | "limited";

export interface CatalogItem {
  // identity
  slug: string;
  name: string;
  category: CatalogCategory;

  // copy
  summary: string;
  description: string[];
  includes: string[];
  outcomes?: string[];

  // commerce
  price: string;
  priceNote?: string;
  cta: CatalogCTA;

  // shape & timing
  timeline?: string;
  scope?: string;
  prerequisites?: string;

  // presentation
  badge?: CatalogBadge;
  order?: number;
}

export const categoryMeta: Record<
  CatalogCategory,
  { label: string; tagline: string }
> = {
  build: {
    label: "Custom Builds",
    tagline: "Small, durable apps you own.",
  },
  training: {
    label: "Workshops",
    tagline: "Learn the system, then run it yourself.",
  },
  advisory: {
    label: "Advisory",
    tagline: "A calm second brain for technical decisions.",
  },
  audit: {
    label: "Audits",
    tagline: "Measure your software against the Quiet Standards.",
  },
};

export const catalogItems: CatalogItem[] = [
  // ============================================
  // CUSTOM BUILDS
  // ============================================
  {
    slug: "quiet-inbox",
    name: "Quiet Inbox",
    category: "build",
    summary:
      "A small, custom email triage app that runs on your own Vercel and Supabase. We hand you the keys.",
    description: [
      "Most inbox tools want to live in your inbox forever. Quiet Inbox is the opposite — a focused triage layer we build for your specific workflow, deploy to your own infrastructure, and walk away from. There is no account to cancel because the account is yours from day one.",
      "We start with a short scoping call to understand which messages actually need your attention and which patterns can be handled with rules, summarization, or routing. Then we build a small Next.js + Supabase app that does exactly that and nothing more.",
    ],
    includes: [
      "Custom triage rules tailored to your inbox patterns",
      "AI summarization for long threads (your provider, your keys)",
      "A simple dashboard you can check once a day instead of constantly",
      "Full source code in your GitHub repository",
      "Deployment to your own Vercel + Supabase project",
      "A 30-minute handoff session so you can run it yourself",
    ],
    outcomes: [
      "You stop checking email reflexively",
      "Important messages still reach you; the rest get out of the way",
      "You own everything — code, data, deployment, exit",
    ],
    price: "From $4,500",
    priceNote: "Scope-dependent; final quote after discovery call",
    cta: { kind: "inquire" },
    timeline: "2–3 weeks from discovery to handoff",
    scope: "One inbox, one workflow. Multi-mailbox setups quoted separately.",
    badge: "popular",
    order: 1,
  },
  {
    slug: "signal-catcher",
    name: "Signal Catcher",
    category: "build",
    summary:
      "A focused outreach watcher that surfaces what's worth a reply, without a CRM in sight.",
    description: [
      "If you're tracking prospects, partners, or sources, you probably don't need a CRM — you need a small, durable system that watches the places that matter and tells you when something happens. Signal Catcher is that system, built for your specific signals.",
      "We identify three to five sources you actually care about (LinkedIn searches, RSS feeds, public filings, job boards, podcast feeds — whatever fits your work) and build a small app that ingests them, filters down to what matters, and surfaces the rest in a calm daily digest.",
    ],
    includes: [
      "Up to five custom signal sources",
      "Filter rules tuned to your patterns",
      "Daily digest email (or Slack message, your choice)",
      "Lightweight web dashboard for review and dismissal",
      "Full source code in your GitHub repository",
      "Deployment to your own Vercel + Supabase",
    ],
    outcomes: [
      "You stop scrolling LinkedIn looking for opportunities",
      "Real signals get a one-line summary; noise gets dropped",
      "No CRM lock-in, no per-seat pricing, no vendor surprises",
    ],
    price: "From $5,500",
    priceNote: "Scope-dependent; final quote after discovery call",
    cta: { kind: "inquire" },
    timeline: "3 weeks from discovery to handoff",
    order: 2,
  },
  {
    slug: "intake-and-onboarding",
    name: "Intake & Onboarding",
    category: "build",
    summary:
      "A custom client intake-to-contract flow that collects what you need and gets out of your way.",
    description: [
      "Most onboarding tools optimize for the vendor's metrics, not yours. Intake & Onboarding is a small custom app we build for your exact process — discovery form, document collection, contract sending, kickoff scheduling — without forcing you into anyone else's workflow.",
      "We map your current intake process, find the friction, and build a Next.js + Supabase app that mirrors how you actually work. Forms feed straight into your CRM (or no CRM at all). Documents land in your storage. Contracts go out through your existing tooling.",
    ],
    includes: [
      "Custom intake form built for your questions",
      "Document upload and secure storage",
      "Automated contract send (DocuSign, HelloSign, or your tool)",
      "Calendar handoff to your existing booking system",
      "Email notifications tuned to your team",
      "Full source code in your GitHub repository",
    ],
    outcomes: [
      "Every new client lands in the same shape, every time",
      "You stop chasing missing information",
      "First impression matches the rest of your work",
    ],
    price: "From $6,000",
    priceNote: "Scope-dependent; final quote after discovery call",
    cta: { kind: "inquire" },
    timeline: "3–4 weeks from discovery to handoff",
    order: 3,
  },
  {
    slug: "field-notebook",
    name: "Field Notebook",
    category: "build",
    summary:
      "A research-to-publication pipeline that keeps your notes, sources, and drafts in the same calm place.",
    description: [
      "Writers, researchers, and analysts collect more than they ever publish. Field Notebook is a small custom app that connects your capture habit to your publishing habit — a single place to drop sources, take notes, and turn them into drafts when the time is right.",
      "We build it around your existing tools and your existing voice. No platform lock-in, no AI-generated slop, no algorithmic feed. Just a quiet workspace that respects what you've already saved.",
    ],
    includes: [
      "Custom capture interface (web, mobile-friendly)",
      "Source tagging and full-text search",
      "Draft workspace with your preferred export format",
      "Optional AI assistance (your provider, your keys)",
      "Full source code in your GitHub repository",
      "Deployment to your own Vercel + Supabase",
    ],
    outcomes: [
      "Your captured material becomes raw material for new work",
      "You stop losing things in 14 different apps",
      "You own every word and every link",
    ],
    price: "From $5,000",
    priceNote: "Scope-dependent; final quote after discovery call",
    cta: { kind: "inquire" },
    timeline: "3 weeks from discovery to handoff",
    order: 4,
  },

  // ============================================
  // WORKSHOPS
  // ============================================
  {
    slug: "sovereign-stack-workshop",
    name: "Sovereign Stack Workshop",
    category: "training",
    summary:
      "A half-day session on owning your data, your deploys, and your exit.",
    description: [
      "Most software runs on infrastructure you don't control, with data you can't fully export, on terms you didn't read. The Sovereign Stack Workshop is a half-day, hands-on session that teaches you the alternative: a stack you own, a deployment you understand, and an exit you could execute today if you needed to.",
      "By the end of the workshop, you'll have deployed a small working app to your own Vercel and Supabase, with your code in your own GitHub. You'll understand exactly what each piece does, why it costs what it costs, and how to replace any one of them without losing your work.",
    ],
    includes: [
      "Half-day live session (4 hours, recorded)",
      "Hands-on deployment of a starter app to your own infrastructure",
      "Written guide covering Vercel, Supabase, GitHub, and domain setup",
      "30-day async follow-up window for questions",
    ],
    outcomes: [
      "You can deploy and own a small app end-to-end",
      "You understand the real cost of your stack",
      "You know how to leave any vendor without losing your work",
    ],
    price: "$297",
    cta: { kind: "inquire", ctaLabel: "Reserve a seat" },
    timeline: "Scheduled monthly; small groups",
    prerequisites: "Basic comfort with the command line is helpful but not required.",
    order: 5,
  },
  {
    slug: "personal-knowledge-system-intensive",
    name: "Personal Knowledge System Intensive",
    category: "training",
    summary:
      "A focused workshop on building a knowledge system that thinks with you — and an AI workflow that knows your business.",
    description: [
      "Most people collect information they never use. The Personal Knowledge System Intensive teaches you to capture what matters, organize it so you can find it, and structure it so AI tools start producing work that sounds like you instead of generic noise.",
      "This is tool-agnostic — Notion, Obsidian, Apple Notes, plain text, whatever you already use. The system is the point; the tool is interchangeable.",
    ],
    includes: [
      "Two live sessions (3 hours each, recorded)",
      "A working capture and retrieval method tailored to your work",
      "AI prompting workflows that pull from your own knowledge base",
      "Written reference guide and templates",
      "30-day async follow-up window",
    ],
    outcomes: [
      "You stop starting from scratch on every proposal, email, or project",
      "AI starts producing work that actually sounds like you",
      "Your past thinking becomes raw material for your current work",
    ],
    price: "$497",
    priceNote: "Per seat",
    cta: { kind: "inquire", ctaLabel: "Reserve a seat" },
    timeline: "Quarterly cohorts; small groups",
    order: 6,
  },
  {
    slug: "quiet-systems-cohort",
    name: "The Quiet Systems Cohort",
    category: "training",
    summary:
      "A six-week small group for founders building the systems that handle the operational work.",
    description: [
      "The Quiet Systems Cohort is six weeks, small group, hands-on. You leave with a working personal knowledge system, an AI workflow that knows your business, and the confidence to build the next system yourself.",
      "We meet weekly. Between sessions you build. By the end, you have something you actually use — not a notebook full of ideas you never executed on.",
    ],
    includes: [
      "Six weekly live sessions (90 minutes each)",
      "Small group: maximum 8 founders per cohort",
      "Personal knowledge system you build during the program",
      "Two custom AI workflows tuned to your business",
      "Private async channel for questions throughout",
      "Lifetime access to recordings",
    ],
    outcomes: [
      "A working knowledge system you actually use",
      "Two AI workflows that handle real work for you",
      "Confidence to build the next system on your own",
    ],
    price: "$2,500",
    priceNote: "Per seat; small cohorts gated by application",
    cta: { kind: "inquire", ctaLabel: "Apply for a seat" },
    timeline: "Six weeks; quarterly cohorts",
    badge: "limited",
    order: 7,
  },
  {
    slug: "team-workshop-ai-with-context",
    name: "Team Workshop: AI With Context",
    category: "training",
    summary:
      "A hands-on team session on giving AI the context it needs to stop sounding generic.",
    description: [
      "Most AI rollouts inside small teams stall because nobody knows how to give the model enough context. This workshop fixes that. We come to your team (remote or in-person) and run a hands-on session that teaches everyone the same vocabulary and the same workflows.",
      "By the end, your team has shared prompts, shared context documents, and a shared sense of when AI helps and when it gets in the way.",
    ],
    includes: [
      "Half-day live session (4 hours)",
      "Custom workshop tailored to your team's actual work",
      "Shared prompt library you keep and edit",
      "Context document templates",
      "30-day async follow-up window for the whole team",
    ],
    outcomes: [
      "Your whole team uses AI the same way",
      "AI output starts sounding like your business",
      "You stop having the same conversation about AI every week",
    ],
    price: "$247",
    priceNote: "Per seat; minimum 3 seats",
    cta: { kind: "inquire", ctaLabel: "Schedule for your team" },
    order: 8,
  },

  // ============================================
  // ADVISORY
  // ============================================
  {
    slug: "calm-counsel",
    name: "Calm Counsel",
    category: "advisory",
    summary:
      "A monthly retainer for founders making technical bets — one call, one written brief, unlimited async questions.",
    description: [
      "Calm Counsel is for founders who don't need a full-time technical co-founder but do need a calm second brain on the technical side of the business. One scheduled monthly call, one written brief summarizing what we discussed and what to do next, and unlimited async questions in between.",
      "The brief is the point. Every month you get a short written document you can hand to your team, your investors, or your future self. You stop forgetting what we decided.",
    ],
    includes: [
      "One 60-minute call per month",
      "Written brief after every call",
      "Unlimited async questions via email",
      "Direct review of any technical decision in flight",
      "Month-to-month, no annual commitment",
    ],
    outcomes: [
      "You make better technical bets",
      "You have a written record of every decision",
      "You stop having the same internal debate twice",
    ],
    price: "$1,500",
    priceNote: "Per month; cancel anytime",
    cta: { kind: "inquire", ctaLabel: "Start a conversation" },
    badge: "popular",
    order: 9,
  },
  {
    slug: "fractional-technical-conscience",
    name: "Fractional Technical Conscience",
    category: "advisory",
    summary:
      "By the hour, on retainer, or by the project. We help you say no to the wrong build.",
    description: [
      "Sometimes you don't need a strategy. You need someone to look at a vendor proposal, a roadmap, or a hiring decision and tell you whether it's the right move. Fractional Technical Conscience is exactly that — focused, hourly technical judgment from someone who has built and shipped a lot of small, durable software.",
      "Think of it as a consult with a calm friend who happens to know the landscape. We don't try to scope work into our own pipeline. If the answer is 'do nothing,' we'll tell you.",
    ],
    includes: [
      "Hourly engagement, no minimum",
      "Async written response within 1 business day",
      "Optional 30 or 60-minute call",
      "Honest 'this is the wrong build' answers when warranted",
    ],
    outcomes: [
      "You make a better call on the next decision",
      "You spend less on tools and contractors that wouldn't work",
      "You have a sounding board you trust",
    ],
    price: "$300",
    priceNote: "Per hour",
    cta: { kind: "inquire", ctaLabel: "Start a conversation" },
    order: 10,
  },
  {
    slug: "half-day-strategy-session",
    name: "Half-Day Strategy Session",
    category: "advisory",
    summary:
      "Four focused hours on a single technical question, with a written follow-up.",
    description: [
      "Sometimes you need more than an hour and less than a retainer. The Half-Day Strategy Session is four focused hours on one technical question — a build vs. buy decision, a vendor migration, a system audit, a roadmap stress test — followed by a written summary you can share with your team.",
      "We come prepared (you send a brief beforehand), we work through the question together, and you walk away with a document you can act on.",
    ],
    includes: [
      "Four hours of focused live work (one block or split into two)",
      "Pre-session brief review (no extra charge)",
      "Written summary and recommendation document",
      "Two weeks of async follow-up questions",
    ],
    outcomes: [
      "One hard technical question, decided",
      "A document your team can act on",
      "Clarity instead of more open tabs",
    ],
    price: "$1,200",
    cta: { kind: "inquire", ctaLabel: "Schedule a session" },
    timeline: "Booked one to two weeks out",
    order: 11,
  },

  // ============================================
  // AUDITS
  // ============================================
  {
    slug: "qsf-self-audit-toolkit",
    name: "QSF Self-Audit Toolkit",
    category: "audit",
    summary:
      "The Quiet Standards Framework, packaged as a self-service toolkit. Free.",
    description: [
      "The Quiet Standards Framework is 104 auditable criteria across attention, data sovereignty, honesty, departure, respect, durability, and governance. The Self-Audit Toolkit packages all 104 criteria as a free download — a checklist, a scoring rubric, and a guide to interpreting the results.",
      "If you want to know how your software measures up against calm tech principles, this is where to start. No call required.",
    ],
    includes: [
      "104-criterion checklist (PDF and editable spreadsheet)",
      "Scoring rubric for each criterion",
      "Interpretation guide",
      "Sample audit report from a published evaluation",
    ],
    outcomes: [
      "An honest, internal score for your software",
      "A starting point for remediation conversations",
      "A shared language for calm tech across your team",
    ],
    price: "Free",
    cta: { kind: "inquire", ctaLabel: "Request the toolkit" },
    order: 12,
  },
  {
    slug: "qsf-guided-audit",
    name: "QSF Guided Audit",
    category: "audit",
    summary:
      "We run the full 104-criterion audit on your product and deliver a prioritized remediation report.",
    description: [
      "The Guided Audit is the full Quiet Standards Framework evaluation, run by us, on your product. We work through every one of the 104 criteria, document our findings, and deliver a written report with your score, your failures, and a prioritized path to remediation.",
      "This is the right step if you've already done a self-audit and want a second pair of eyes — or if you want a credible third-party score you can share publicly.",
    ],
    includes: [
      "Full 104-criterion evaluation",
      "Written report with score and findings",
      "Prioritized remediation roadmap",
      "60-minute review call to walk through results",
      "Permission to publish your score if you choose",
    ],
    outcomes: [
      "A credible, third-party calm tech score",
      "A clear list of what to fix first",
      "A document your team and customers can read",
    ],
    price: "$2,500",
    cta: { kind: "inquire", ctaLabel: "Request an audit" },
    timeline: "2 weeks from kickoff to delivered report",
    order: 13,
  },
];

// ============================================
// HELPERS
// ============================================

export const catalogByCategory: Record<CatalogCategory, CatalogItem[]> = {
  build: [],
  training: [],
  advisory: [],
  audit: [],
};

for (const item of catalogItems) {
  catalogByCategory[item.category].push(item);
}

for (const category of Object.keys(catalogByCategory) as CatalogCategory[]) {
  catalogByCategory[category].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999),
  );
}

export function getCatalogItem(slug: string): CatalogItem | undefined {
  return catalogItems.find((item) => item.slug === slug);
}

export function getCatalogSlugs(): string[] {
  return catalogItems.map((item) => item.slug);
}

export const categoryOrder: CatalogCategory[] = [
  "build",
  "training",
  "advisory",
  "audit",
];
