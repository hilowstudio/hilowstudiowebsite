// Hi Low Studio productized services catalog
// Content-as-code: edit this file to add or change offerings.

export type CatalogCategory =
  | "routine"
  | "build"
  | "training"
  | "advisory"
  | "audit";

export type CatalogCTA =
  | { kind: "buy"; stripeUrl: string; ctaLabel?: string }
  | { kind: "inquire"; ctaLabel?: string };

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
  order?: number;
}

export const categoryMeta: Record<
  CatalogCategory,
  { label: string; tagline: string }
> = {
  routine: {
    label: "Routines",
    tagline: "Small Claude Code routines you own.",
  },
  build: {
    label: "Custom builds",
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
  // ROUTINES
  // Small downloadable Claude Code .md routines.
  // NOTE: These are listed as `inquire` for now. When Stripe Payment Links
  // are created, switch each cta to:
  //   { kind: "buy", stripeUrl: "https://buy.stripe.com/...", ctaLabel: "..." }
  // ============================================
  {
    slug: "the-quiet-meeting",
    name: "The Quiet Meeting",
    category: "routine",
    summary:
      "A small Claude Code routine that builds your prep for any meeting from the email and notes you already have.",
    description: [
      "Most meetings are forgettable because we walk in cold. The Quiet Meeting is a small Claude Code routine that turns your existing email history and meeting notes into a one-page prep brief, on demand. Type a single command and you get who's in the room, what was said last time, and what you said you'd do.",
      "It's a single .md file. You drop it into your Claude Code setup, edit it freely, and own it forever. There's nothing to log into and nothing to cancel.",
    ],
    includes: [
      "One .md routine you drop into your Claude Code project",
      "A plain-English setup guide with screenshots",
      "Sensible defaults you can edit in five minutes",
      "No subscription, no account, no platform",
    ],
    outcomes: [
      "You walk into meetings prepared",
      "You stop forgetting what you committed to last time",
      "You own the routine forever, so you can edit, fork, or share it",
    ],
    price: "$19",
    priceNote: "One-time. The file is yours.",
    cta: { kind: "inquire", ctaLabel: "Get this routine" },
    timeline: "Delivered after purchase",
    prerequisites:
      "Claude Code installed; Gmail and Calendar connected via MCP",
    order: 1,
  },
  {
    slug: "the-quiet-day",
    name: "The Quiet Day",
    category: "routine",
    summary:
      "Three Claude Code routines that bookend your day: morning briefing, meeting prep, and end-of-day capture.",
    description: [
      "Your day deserves bookends. The Quiet Day bundle includes three small Claude Code routines that handle the work of starting, navigating, and closing the day, without taking up your attention while it's happening.",
      "Run /daybreak in the morning to get a one-page briefing pulled from your email, calendar, and notes. Run /prep before any meeting to get walked-in-ready. Run /sundown at the end of the day to capture what happened, what got committed, and what's still open.",
      "Three .md files, three setup guides, no platform. You own everything.",
    ],
    includes: [
      "Three .md routines: /daybreak, /prep, /sundown",
      "Three plain-English setup guides",
      "Sensible defaults you can edit in minutes",
      "Lifetime ownership of the files",
    ],
    outcomes: [
      "Your day starts and ends on purpose, not accident",
      "You stop scrolling email looking for what matters",
      "You stop dropping commitments between meetings",
    ],
    price: "$59",
    priceNote: "One-time. Save $16 vs. buying individually.",
    cta: { kind: "inquire", ctaLabel: "Get the bundle" },
    timeline: "Delivered after purchase",
    prerequisites:
      "Claude Code installed; Gmail, Calendar, and Drive connected via MCP",
    order: 2,
  },
  {
    slug: "the-quiet-practice",
    name: "The Quiet Practice",
    category: "routine",
    summary:
      "All six Hi Low routines: a complete personal operating system that lives in your own Claude Code.",
    description: [
      "The Quiet Practice is the full set: six small Claude Code routines that handle your mornings, meetings, decisions, weekly resets, and personal relationship tracking. Together they form a quiet personal operating system that lives in your own Claude Code environment, with no platform, no subscription, and no account to lose.",
      "Run them when you need them. Edit them when your work changes. Share the files with whoever you want. They're yours.",
    ],
    includes: [
      "Six .md routines: /daybreak, /prep, /sundown, /align, /weekly, /ledger",
      "Six plain-English setup guides",
      "Both versions of /prep (with and without the personal ledger)",
      "Sensible defaults you can edit in minutes",
      "Lifetime ownership",
    ],
    outcomes: [
      "A personal operating system you own and edit",
      "Mornings, meetings, decisions, and follow-ups handled",
      "No subscription, no platform, no account to lose",
    ],
    price: "$89",
    priceNote: "One-time. Save $42 vs. buying individually.",
    cta: { kind: "inquire", ctaLabel: "Get the full practice" },
    timeline: "Delivered after purchase",
    prerequisites:
      "Claude Code installed; Gmail, Calendar, Drive, and a Google Sheet for the ledger",
    order: 3,
  },

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
      "Most inbox tools want to live in your inbox forever. Quiet Inbox is the opposite. It is a focused triage layer we build for your specific workflow, deploy to your own infrastructure, and walk away from. There is no account to cancel because the account is yours from day one.",
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
      "You own everything: code, data, deployment, exit",
    ],
    price: "From $4,500",
    priceNote: "Scope-dependent; final quote after discovery call",
    cta: { kind: "inquire" },
    timeline: "2–3 weeks from discovery to handoff",
    scope: "One inbox, one workflow. Multi-mailbox setups quoted separately.",
    order: 1,
  },
  {
    slug: "signal-catcher",
    name: "Signal Catcher",
    category: "build",
    summary:
      "A focused outreach watcher that surfaces what's worth a reply, without a CRM in sight.",
    description: [
      "If you're tracking prospects, partners, or sources, you probably don't need a CRM. You need a small, durable system that watches the places that matter and tells you when something happens. Signal Catcher is that system, built for your specific signals.",
      "We identify three to five sources you actually care about (LinkedIn searches, RSS feeds, public filings, job boards, podcast feeds, whatever fits your work) and build a small app that ingests them, filters down to what matters, and surfaces the rest in a calm daily digest.",
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
      "Most onboarding tools optimize for the vendor's metrics, not yours. Intake & Onboarding is a small custom app we build for your exact process (discovery form, document collection, contract sending, kickoff scheduling) without forcing you into anyone else's workflow.",
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
      "Writers, researchers, and analysts collect more than they ever publish. Field Notebook is a small custom app that connects your capture habit to your publishing habit. A single place to drop sources, take notes, and turn them into drafts when the time is right.",
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
      "A focused workshop on building a knowledge system that thinks with you, and an AI workflow that knows your business.",
    description: [
      "Most people collect information they never use. The Personal Knowledge System Intensive teaches you to capture what matters, organize it so you can find it, and structure it so AI tools start producing work that sounds like you instead of generic noise.",
      "This is tool-agnostic. Notion, Obsidian, Apple Notes, plain text, whatever you already use. The system is the point; the tool is interchangeable.",
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
      "We meet weekly. Between sessions you build. By the end, you have something you actually use, not a notebook full of ideas you never executed on.",
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
  {
    slug: "one-on-one-quiet-stack-workshop",
    name: "1-on-1 Quiet Stack Workshop",
    category: "training",
    summary:
      "A focused private session where we build your Claude Code routines together, on your machine, with your data.",
    description: [
      "Some people learn best by reading the docs. Others learn best by building the thing. The 1-on-1 Quiet Stack Workshop is for the second group. A private, focused session where we sit down together over Zoom, connect your tools, and build your Claude Code routines around your actual work.",
      "By the end of the session you have a working personal operating system: your routines installed, your context configured, your daily practice set up. You leave with a system, not a checklist of homework.",
    ],
    includes: [
      "One 90-minute live build session, 1-on-1",
      "All six routines installed and tuned to your workflow",
      "Custom context files based on your actual goals and tools",
      "30-day async follow-up window for tweaks and questions",
    ],
    outcomes: [
      "A working personal Claude Code system, set up and running",
      "Confidence to maintain and edit it yourself",
      "A reference point for future build work",
    ],
    price: "$749",
    cta: { kind: "inquire", ctaLabel: "Schedule a session" },
    timeline: "Booked one to two weeks out",
    prerequisites: "Claude Code installed; Google account ready to connect",
    order: 9,
  },
  {
    slug: "done-for-you-quiet-stack",
    name: "Done-For-You Quiet Stack Setup",
    category: "training",
    summary:
      "We build your Claude Code chief of staff for you, configured around your goals, tools, and team.",
    description: [
      "If you want the system but don't want to sit through a workshop, the Done-For-You Quiet Stack Setup is the answer. We design and configure your personal Claude Code routines around your priorities, your tools, and your team, then hand you a working system, end-to-end.",
      "We start with a short discovery call. We build everything in your environment over the following week. We hand off with a 30-minute walkthrough so you can run it yourself.",
    ],
    includes: [
      "30-minute discovery call",
      "All six routines installed and tuned to your workflow",
      "Custom context files built from your goals, tools, and team",
      "30-minute handoff walkthrough",
      "30-day async follow-up window for tweaks",
    ],
    outcomes: [
      "A fully configured personal Claude Code system",
      "No setup time on your part",
      "You own everything: code, configuration, context",
    ],
    price: "$1,200",
    cta: { kind: "inquire", ctaLabel: "Get started" },
    timeline: "1 week from discovery to handoff",
    prerequisites: "Claude Code installable on your machine; Google account ready",
    order: 10,
  },
  {
    slug: "private-team-onboarding",
    name: "Private Team Onboarding",
    category: "training",
    summary:
      "We come to your team (remote or in person) for a half-day hands-on session that gets everyone onto the same calm Claude Code stack.",
    description: [
      "If you're rolling Claude Code out to a team (an accelerator cohort, a small operations team, a community) the Private Team Onboarding is the fastest way to do it without leaving anyone behind. We come to you, connect everyone's tools, and build the same set of routines on every machine.",
      "By the end of the session, every participant has a working personal operating system and the same shared vocabulary. You leave with a team that speaks the same language about AI, automation, and ownership.",
    ],
    includes: [
      "3-hour hands-on session for up to 12 people",
      "Pre-session intake to tune the workshop to your team",
      "All six routines installed on every machine",
      "Shared context and prompt library for the team",
      "30-day async follow-up window for the whole group",
    ],
    outcomes: [
      "Your whole team uses the same calm Claude Code stack",
      "Shared vocabulary across the org",
      "A working system on every machine",
    ],
    price: "$4,500",
    priceNote: "Per session; up to 12 participants",
    cta: { kind: "inquire", ctaLabel: "Schedule for your team" },
    timeline: "Booked 2–3 weeks out",
    order: 11,
  },

  // ============================================
  // ADVISORY
  // ============================================
  {
    slug: "calm-counsel",
    name: "Calm Counsel",
    category: "advisory",
    summary:
      "A monthly retainer for founders making technical bets. One call, one written brief, unlimited async questions.",
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
    order: 9,
  },
  {
    slug: "fractional-technical-conscience",
    name: "Fractional Technical Conscience",
    category: "advisory",
    summary:
      "By the hour, on retainer, or by the project. We help you say no to the wrong build.",
    description: [
      "Sometimes you don't need a strategy. You need someone to look at a vendor proposal, a roadmap, or a hiring decision and tell you whether it's the right move. Fractional Technical Conscience is exactly that: focused, hourly technical judgment from someone who has built and shipped a lot of small, durable software.",
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
      "Sometimes you need more than an hour and less than a retainer. The Half-Day Strategy Session is four focused hours on one technical question (a build vs. buy decision, a vendor migration, a system audit, a roadmap stress test) followed by a written summary you can share with your team.",
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
    slug: "qsf-self-audit-skill",
    name: "QSF Self-Audit Skill",
    category: "audit",
    summary:
      "A Claude Code skill that runs the full 104-criterion Quiet Standards audit on your own codebase. Free.",
    description: [
      "The Quiet Standards Framework is 104 auditable criteria across attention, data sovereignty, honesty, departure, respect, durability, and governance. The Self-Audit Skill packages the full framework as a Claude Code skill. Drop it into your skills folder and ask Claude to run a QSF audit on any project.",
      "The skill walks the model through every criterion, collects evidence, scores against the pass conditions, and produces a complete scorecard with a tier determination. No platform, no account, no waiting. You own the skill, you own the output, you run it whenever you want.",
    ],
    includes: [
      "Full Claude Code skill (SKILL.md + rules + criteria data)",
      "All 104 criteria with per-criterion audit instructions, pass conditions, and fail indicators",
      "Complete scorecard template",
      "Installation guide (under 5 minutes, no coding)",
      "Lifetime ownership of the files",
    ],
    outcomes: [
      "A working QSF audit you can run on any codebase today",
      "An honest, internal score for your software",
      "A shared language for calm tech across your team",
    ],
    price: "Free",
    priceNote: "Requires Claude Code installed",
    cta: { kind: "inquire", ctaLabel: "Request the skill" },
    prerequisites: "Claude Code installed on your machine",
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
      "This is the right step if you've already done a self-audit and want a second pair of eyes, or if you want a credible third-party score you can share publicly.",
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
  routine: [],
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
  "routine",
  "build",
  "training",
  "advisory",
  "audit",
];
