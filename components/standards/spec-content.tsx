"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Criterion = {
    id: string;
    type: "must-pass" | "points";
    points?: number;
    text: string;
};

type Subdomain = {
    title: string;
    criteria: Criterion[];
};

type Domain = {
    number: string;
    title: string;
    principle: string;
    totalCriteria: number;
    mustPass: number;
    availablePoints: number;
    subdomains: Subdomain[];
};

const domains: Domain[] = [
    {
        number: "01",
        title: "Attention",
        principle:
            "Design for the smallest possible amount of your attention",
        totalCriteria: 23,
        mustPass: 6,
        availablePoints: 27,
        subdomains: [
            {
                title: "1A. Notification Architecture",
                criteria: [
                    { id: "ATT-01", type: "must-pass", text: "No push notifications unless user-configured trigger. Marketing and re-engagement notifications are an automatic fail." },
                    { id: "ATT-02", type: "must-pass", text: "Single, accessible control to disable ALL non-critical notifications in one action." },
                    { id: "ATT-03", type: "must-pass", text: "Default notification settings are the minimum permission state. User opts in, not out." },
                    { id: "ATT-04", type: "points", points: 2, text: "User-defined quiet hours during which notifications are queued and held, not just muted." },
                    { id: "ATT-05", type: "points", points: 2, text: "Notifications contain enough context to be actionable without opening the app." },
                    { id: "ATT-06", type: "points", points: 2, text: "Non-urgent notifications batched into digest form rather than delivered individually." },
                    { id: "ATT-07", type: "points", points: 1, text: "User-accessible notification log showing count and content of notifications sent in the last 30 days." },
                    { id: "ATT-08", type: "points", points: 1, text: "Respects OS-level notification settings (Do Not Disturb, Focus modes) without circumventing them." },
                ],
            },
            {
                title: "1B. Engagement Pattern Prohibition",
                criteria: [
                    { id: "ATT-09", type: "must-pass", text: "No infinite scroll. Content feeds must terminate or paginate with a clear endpoint." },
                    { id: "ATT-10", type: "must-pass", text: "No streak mechanics, loss-aversion timers, or any mechanism that penalizes the user for not using the product." },
                    { id: "ATT-11", type: "must-pass", text: "No gamification (points, badges, leaderboards, levels, XP) unless the product is explicitly a game." },
                    { id: "ATT-12", type: "points", points: 2, text: "No auto-play media without explicit user initiation on each piece of content." },
                    { id: "ATT-13", type: "points", points: 2, text: "No variable-ratio reinforcement schedules (pull-to-refresh revealing new content, randomized rewards)." },
                    { id: "ATT-14", type: "points", points: 2, text: "Session length is transparent to the user through a visible timer, session summary, or periodic check-in." },
                    { id: "ATT-15", type: "points", points: 1, text: "No social comparison metrics (follower counts, like counts, view counts) unless the product\u2019s explicit purpose requires it." },
                ],
            },
            {
                title: "1C. Interface Restraint",
                criteria: [
                    { id: "ATT-16", type: "points", points: 2, text: "Primary task flow completable in 3 or fewer screens from launch." },
                    { id: "ATT-17", type: "points", points: 2, text: "No interstitial screens or splash animations exceeding 2 seconds when content is available." },
                    { id: "ATT-18", type: "points", points: 2, text: "Modal dialogs used only for destructive actions or critical confirmations, not for promotions, upsells, or announcements." },
                    { id: "ATT-19", type: "points", points: 2, text: "Supports prefers-reduced-motion at the OS level and reduces or eliminates animations accordingly." },
                    { id: "ATT-20", type: "points", points: 1, text: "Visual hierarchy clearly distinguishes primary from secondary actions. No competing calls-to-action of equal weight." },
                    { id: "ATT-21", type: "points", points: 1, text: "Empty states are informative and calm. Not used for upselling, cross-promotion, or creating anxiety." },
                    { id: "ATT-22", type: "points", points: 1, text: "No use of color red, urgency language, or pulsing/animating elements to manufacture false urgency." },
                    { id: "ATT-23", type: "points", points: 1, text: "Typography and layout maintain a readable measure (line length 45\u201380 characters for body text)." },
                ],
            },
        ],
    },
    {
        number: "02",
        title: "Data Sovereignty",
        principle: "Your data belongs to you",
        totalCriteria: 18,
        mustPass: 5,
        availablePoints: 27,
        subdomains: [
            {
                title: "2A. Data Portability",
                criteria: [
                    { id: "DAT-01", type: "must-pass", text: "Full data export in at least one open, machine-readable format (JSON, CSV, XML, or domain-appropriate open standard)." },
                    { id: "DAT-02", type: "must-pass", text: "Data export is complete \u2014 includes ALL user-generated content, metadata, configuration, and history." },
                    { id: "DAT-03", type: "must-pass", text: "Export accessible within 3 clicks from settings. No support ticket, waiting period exceeding 24 hours, or discouragement flow." },
                    { id: "DAT-04", type: "points", points: 3, text: "API or webhook system for real-time or near-real-time data sync with external systems chosen by the user." },
                    { id: "DAT-05", type: "points", points: 2, text: "Exported data structured and documented sufficiently for import into a competing product or custom system." },
                    { id: "DAT-06", type: "points", points: 2, text: "Supports import of data from at least one competing product or common format in its category." },
                ],
            },
            {
                title: "2B. Data Collection Minimalism",
                criteria: [
                    { id: "DAT-07", type: "must-pass", text: "No data collected, stored, or transmitted beyond what is required for features the user is actively using." },
                    { id: "DAT-08", type: "must-pass", text: "Never sells, shares, or provides user data to third-party advertisers, data brokers, or ad networks." },
                    { id: "DAT-09", type: "points", points: 3, text: "Real-time, user-accessible inventory of all data held about the user \u2014 not just privacy policy categories, but an actual data viewer." },
                    { id: "DAT-10", type: "points", points: 2, text: "Analytics and telemetry, if present, are opt-in (not opt-out) and clearly explain what is collected and why." },
                    { id: "DAT-11", type: "points", points: 2, text: "Core features function with all optional data collection declined." },
                    { id: "DAT-12", type: "points", points: 1, text: "Stated data retention periods with automatic purge when purpose expires." },
                ],
            },
            {
                title: "2C. Data Security & Deletion",
                criteria: [
                    { id: "DAT-13", type: "points", points: 3, text: "Sensitive user data encrypted at rest using industry-standard encryption (AES-256 or equivalent)." },
                    { id: "DAT-14", type: "points", points: 3, text: 'Account deletion is complete, permanent, and accessible within the application. No "contact support to delete."' },
                    { id: "DAT-15", type: "points", points: 2, text: 'Clear distinction between "deactivation" (data retained) and "deletion" (data destroyed), with both offered.' },
                    { id: "DAT-16", type: "points", points: 2, text: "Backups of user data purged within 30 days of deletion request." },
                    { id: "DAT-17", type: "points", points: 1, text: "Supports industry-standard authentication (OAuth 2.0, passkeys); phone number not mandatory." },
                    { id: "DAT-18", type: "points", points: 1, text: "Data transmission uses TLS 1.2 or higher exclusively." },
                ],
            },
        ],
    },
    {
        number: "03",
        title: "Honesty",
        principle:
            "Amplify the best of people and technology without confusing the two",
        totalCriteria: 16,
        mustPass: 5,
        availablePoints: 22,
        subdomains: [
            {
                title: "3A. Dark Pattern Prohibition",
                criteria: [
                    { id: "HON-01", type: "must-pass", text: "No confirmshaming (guilt-laden language on decline buttons)." },
                    { id: "HON-02", type: "must-pass", text: "No roach motel patterns (easy to sign up, deliberately difficult to cancel or delete)." },
                    { id: "HON-03", type: "must-pass", text: "No bait-and-switch (advertising one feature, price, or capability and delivering another after commitment)." },
                    { id: "HON-04", type: "must-pass", text: "Cancellation or downgrade flow contains no more steps than the signup or upgrade flow." },
                    { id: "HON-05", type: "points", points: 2, text: "No pre-checked optional consent boxes, newsletter signups, or add-on purchases." },
                    { id: "HON-06", type: "points", points: 2, text: 'Price presented clearly at point of decision. No hidden fees, no "starting at" pricing that escalates.' },
                    { id: "HON-07", type: "points", points: 2, text: 'No false urgency (fake countdown timers, "only 3 left!" when inventory is not genuinely scarce).' },
                    { id: "HON-08", type: "points", points: 1, text: "No visual misdirection toward company-preferred option and away from user-preferred option." },
                ],
            },
            {
                title: "3B. Algorithmic Transparency",
                criteria: [
                    { id: "HON-09", type: "points", points: 3, text: "If algorithmic curation is used, primary ranking factors disclosed in plain language accessible from the interface." },
                    { id: "HON-10", type: "points", points: 2, text: "At least one non-algorithmic view of content (chronological, alphabetical, or user-defined sort) available." },
                    { id: "HON-11", type: "points", points: 2, text: "AI-generated content clearly labeled as such and distinguishable from human-authored content." },
                    { id: "HON-12", type: "points", points: 1, text: "No dynamic pricing personalized by user behavior or inferred willingness to pay." },
                ],
            },
            {
                title: "3C. Business Model Transparency",
                criteria: [
                    { id: "HON-13", type: "must-pass", text: "Monetization model stated plainly on marketing site and within the application." },
                    { id: "HON-14", type: "points", points: 3, text: "If the product is free, the application explains how it is funded." },
                    { id: "HON-15", type: "points", points: 2, text: "No degrading existing features to upsell paid tiers without advance notice and data export option." },
                    { id: "HON-16", type: "points", points: 2, text: "Terms of service available in a plain-language summary at maximum 8th-grade reading level." },
                ],
            },
        ],
    },
    {
        number: "04",
        title: "Departure",
        principle: "Solve the problem, then get out of your way",
        totalCriteria: 12,
        mustPass: 4,
        availablePoints: 15,
        subdomains: [
            {
                title: "4A. Session Closure",
                criteria: [
                    { id: "DEP-01", type: "points", points: 2, text: 'No retention dialogs, "Are you sure?" prompts, or emotional appeals when closing (unsaved-work warnings permitted).' },
                    { id: "DEP-02", type: "points", points: 2, text: "Auto-saves state so user can close at any moment without loss of work." },
                    { id: "DEP-03", type: "points", points: 1, text: "No re-engagement emails within 72 hours of a user\u2019s last session." },
                    { id: "DEP-04", type: "points", points: 1, text: "No ads, surveys, or promotional content displayed at the closing or logout moment." },
                ],
            },
            {
                title: "4B. Account Offboarding",
                criteria: [
                    { id: "DEP-05", type: "must-pass", text: "Subscription cancellable entirely within the application or web interface. No phone calls, retention agents, or mailed letters." },
                    { id: "DEP-06", type: "must-pass", text: "After cancellation, previously paid-for data remains accessible and exportable for a minimum of 30 days." },
                    { id: "DEP-07", type: "must-pass", text: "Cancellation confirmation is clear and immediate with the effective date and what happens to user data." },
                    { id: "DEP-08", type: "points", points: 2, text: "Transfer ownership capability for shared accounts, teams, or family plans." },
                ],
            },
            {
                title: "4C. Graceful Degradation",
                criteria: [
                    { id: "DEP-09", type: "must-pass", text: "If internet required for primary functionality, clearly stated before signup and on marketing materials." },
                    { id: "DEP-10", type: "points", points: 3, text: "Meaningful offline functionality. Core features degrade gracefully rather than failing completely." },
                    { id: "DEP-11", type: "points", points: 2, text: "Documented plan for user data if company shuts down, referenced in Terms of Service." },
                    { id: "DEP-12", type: "points", points: 2, text: "No mandatory updates that remove features, change the interface substantially, or reset preferences without choice." },
                ],
            },
        ],
    },
    {
        number: "05",
        title: "Respect",
        principle: "Respect your time and social norms",
        totalCriteria: 14,
        mustPass: 3,
        availablePoints: 19,
        subdomains: [
            {
                title: "5A. Temporal Respect",
                criteria: [
                    { id: "RES-01", type: "points", points: 3, text: "User-defined schedules governing when the application may send notifications, sync data, or perform background activities." },
                    { id: "RES-02", type: "points", points: 2, text: "Default notification times restricted to 8:00\u202fAM\u2013\u20099:00\u202fPM in the user\u2019s timezone unless explicitly configured otherwise." },
                    { id: "RES-03", type: "points", points: 2, text: 'No time-of-day or day-of-week urgency messaging ("Weekend sale ends tonight!").' },
                    { id: "RES-04", type: "points", points: 1, text: "Recurring scheduled actions respect user calendar integrations or quiet periods if offered." },
                    { id: "RES-05", type: "points", points: 1, text: "Anniversary, milestone, or commemorative notifications are opt-in only." },
                ],
            },
            {
                title: "5B. Contextual Intelligence",
                criteria: [
                    { id: "RES-06", type: "must-pass", text: "No device sensor access (camera, microphone, location, contacts, health data) without explicit, per-use or per-session consent revocable at any time." },
                    { id: "RES-07", type: "must-pass", text: "No sensor use for purposes beyond stated functionality." },
                    { id: "RES-08", type: "points", points: 2, text: "Respects OS-level Focus or Do Not Disturb states and adjusts behavior accordingly." },
                    { id: "RES-09", type: "points", points: 2, text: 'If location data is used, provides "only while using" option. No core degradation if background location is denied.' },
                    { id: "RES-10", type: "points", points: 1, text: "Just-in-time permission requests only. No requesting permissions at first launch for features not yet attempted." },
                ],
            },
            {
                title: "5C. Resource Respect",
                criteria: [
                    { id: "RES-11", type: "must-pass", text: "No cryptocurrency mining, distributed computation, or use of device resources for purposes unrelated to stated functionality." },
                    { id: "RES-12", type: "points", points: 2, text: "Background resource usage (CPU, memory, battery) proportionate to functionality." },
                    { id: "RES-13", type: "points", points: 2, text: "No keeping device awake or maintaining persistent background connections when user is not actively using the application." },
                    { id: "RES-14", type: "points", points: 1, text: "Installation size and ongoing storage usage documented and reasonable for the product\u2019s category." },
                ],
            },
        ],
    },
    {
        number: "06",
        title: "Durability",
        principle: "Software degrades gracefully",
        totalCriteria: 12,
        mustPass: 3,
        availablePoints: 17,
        subdomains: [
            {
                title: "6A. Accessibility",
                criteria: [
                    { id: "DUR-01", type: "must-pass", text: "WCAG 2.1 Level AA compliance for all primary user flows." },
                    { id: "DUR-02", type: "must-pass", text: "All interactive elements have minimum 44\u00d744 CSS pixel touch targets (mobile) or equivalent keyboard-navigable focus states (desktop)." },
                    { id: "DUR-03", type: "points", points: 3, text: "Fully navigable via keyboard alone. No mouse or touch-only interactions for primary functionality." },
                    { id: "DUR-04", type: "points", points: 2, text: "Screen reader support with appropriate ARIA labels, roles, and live regions for dynamic content." },
                    { id: "DUR-05", type: "points", points: 2, text: "Color is never the sole means of conveying information (error states, status indicators, form validation)." },
                    { id: "DUR-06", type: "points", points: 1, text: "Supports user-configurable text size scaling up to 200% without loss of content or functionality." },
                ],
            },
            {
                title: "6B. Standards & Interoperability",
                criteria: [
                    { id: "DUR-07", type: "must-pass", text: "Uses open web standards. No proprietary plugins, browser-specific features, or single-vendor runtimes for core functionality." },
                    { id: "DUR-08", type: "points", points: 2, text: "Supports or implements relevant open protocols for its domain (CalDAV, RSS/Atom, SMTP, ActivityPub, etc.)." },
                    { id: "DUR-09", type: "points", points: 2, text: "Data format publicly documented, enabling third-party tools to read and process exported data." },
                ],
            },
            {
                title: "6C. Longevity",
                criteria: [
                    { id: "DUR-10", type: "points", points: 2, text: "Publicly accessible changelog documenting changes, removals, and additions." },
                    { id: "DUR-11", type: "points", points: 2, text: "Stated support policy: how long the current version will receive security updates and what happens at end-of-life." },
                    { id: "DUR-12", type: "points", points: 1, text: "Runs on OS versions within 2 major releases. No unreasonably recent hardware requirements." },
                ],
            },
        ],
    },
    {
        number: "07",
        title: "Governance",
        principle: "Transparent and verifiable",
        totalCriteria: 9,
        mustPass: 1,
        availablePoints: 16,
        subdomains: [
            {
                title: "7A. Privacy & Legal Clarity",
                criteria: [
                    { id: "GOV-01", type: "must-pass", text: "Privacy policy exists, is accessible within the application, and was updated within the last 12 months." },
                    { id: "GOV-02", type: "points", points: 3, text: "Privacy policy contains a plain-language summary (maximum 500 words, 8th-grade reading level) covering what data is collected, why, who can see it, how long it is kept, and how to delete it." },
                    { id: "GOV-03", type: "points", points: 2, text: "Users notified of material changes to privacy policy or terms of service before they take effect, with a clear summary of what changed." },
                    { id: "GOV-04", type: "points", points: 2, text: "All third-party services, SDKs, and trackers identified with their data practices disclosed." },
                ],
            },
            {
                title: "7B. User Communication",
                criteria: [
                    { id: "GOV-05", type: "points", points: 2, text: "Publicly accessible way to report bugs, request features, or provide feedback without requiring a social media account." },
                    { id: "GOV-06", type: "points", points: 2, text: "Actual user documentation covering all primary features (not just marketing copy)." },
                    { id: "GOV-07", type: "points", points: 1, text: "Estimated response time for support requests, met at least 80% of the time." },
                ],
            },
            {
                title: "7C. Ethical Commitments",
                criteria: [
                    { id: "GOV-08", type: "points", points: 2, text: "Funding sources publicly disclosed, including any investors or board members with interests in advertising, data brokerage, or attention-extraction industries." },
                    { id: "GOV-09", type: "points", points: 2, text: "Published statement of design principles or ethical commitments that predates and is independent of the QSF certification." },
                ],
            },
        ],
    },
];

function CriterionRow({ criterion }: { criterion: Criterion }) {
    return (
        <div className="flex gap-3 py-2.5 border-b border-ink/5 last:border-b-0">
            <span className="text-xs font-medium text-ink-light w-12 shrink-0 pt-0.5 tracking-wide">
                {criterion.id}
            </span>
            {criterion.type === "must-pass" ? (
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-ink text-paper px-2 py-0.5 rounded shrink-0 h-fit">
                    Must-Pass
                </span>
            ) : (
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-paper-warm text-ink-muted px-2 py-0.5 rounded border border-ink/10 shrink-0 h-fit">
                    {criterion.points} {criterion.points === 1 ? "pt" : "pts"}
                </span>
            )}
            <span className="text-sm text-ink-muted leading-relaxed">
                {criterion.text}
            </span>
        </div>
    );
}

export function SpecContent() {
    return (
        <article className="py-24">
            <div className="container-calm max-w-3xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="mb-20"
                >
                    <p className="text-xs uppercase tracking-widest text-ink-light mb-6">
                        Hi-Low Studio LLC
                    </p>
                    <h1 className="text-4xl md:text-5xl mb-4">
                        The Quiet Standards Framework
                    </h1>
                    <p className="text-lg text-ink-muted mb-8">
                        Auditable Certification Standard for
                        Attention-Respecting Software
                    </p>

                    <div className="w-12 h-px bg-clay mb-8" />

                    <div className="text-sm text-ink-muted space-y-1">
                        <p>
                            <span className="text-ink font-medium">
                                Version 1.0
                            </span>{" "}
                            &middot; 104 criteria &middot; 7 domains &middot;
                            27 must-pass gates &middot; 143 scorable points
                        </p>
                        <p>
                            Published openly. A standard you can&apos;t read
                            isn&apos;t a standard.
                        </p>
                    </div>
                </motion.div>

                {/* Table of Contents */}
                <motion.nav
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.8,
                        delay: 0.1,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="mb-24 p-8 rounded-lg border border-ink/5 bg-paper-warm"
                    aria-label="Table of contents"
                >
                    <h2 className="text-xl mb-6">Contents</h2>
                    <div className="space-y-0">
                        {domains.map((domain) => (
                            <a
                                key={domain.number}
                                href={`#domain-${domain.number}`}
                                className="flex justify-between items-baseline py-2.5 border-b border-ink/5 last:border-b-0 hover:text-clay transition-colors duration-300"
                            >
                                <span className="flex gap-3">
                                    <span className="text-sm font-medium text-clay w-6">
                                        {domain.number}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {domain.title}
                                    </span>
                                </span>
                                <span className="text-xs text-ink-muted">
                                    {domain.totalCriteria} criteria &middot;{" "}
                                    {domain.mustPass} must-pass
                                </span>
                            </a>
                        ))}
                        <a
                            href="#scoring"
                            className="flex justify-between items-baseline py-2.5 hover:text-clay transition-colors duration-300"
                        >
                            <span className="flex gap-3">
                                <span className="text-sm font-medium text-clay w-6">
                                    &nbsp;
                                </span>
                                <span className="text-sm font-medium">
                                    Scoring &amp; Certification
                                </span>
                            </span>
                            <span className="text-xs text-ink-muted">
                                Tiers, evidence types, recertification
                            </span>
                        </a>
                    </div>
                </motion.nav>

                {/* Domains */}
                {domains.map((domain) => (
                    <section
                        key={domain.number}
                        id={`domain-${domain.number}`}
                        className="mb-20 scroll-mt-24"
                    >
                        <div className="border-b-2 border-ink pb-4 mb-8">
                            <span className="text-xs uppercase tracking-widest text-clay mb-2 block">
                                Domain {domain.number}
                            </span>
                            <h2 className="text-3xl mb-1">{domain.title}</h2>
                            <p className="text-sm text-ink-muted italic">
                                &ldquo;{domain.principle}&rdquo;
                            </p>
                            <div className="flex gap-6 mt-3 text-sm text-ink-muted">
                                <span>
                                    <span className="text-ink font-medium text-base">
                                        {domain.totalCriteria}
                                    </span>{" "}
                                    criteria
                                </span>
                                <span>
                                    <span className="text-ink font-medium text-base">
                                        {domain.mustPass}
                                    </span>{" "}
                                    must-pass
                                </span>
                                <span>
                                    <span className="text-ink font-medium text-base">
                                        {domain.availablePoints}
                                    </span>{" "}
                                    available points
                                </span>
                            </div>
                        </div>

                        {domain.subdomains.map((sub) => (
                            <div key={sub.title} className="mb-10">
                                <h3 className="text-base font-medium mb-4 pb-2 border-b border-ink/10 font-sans">
                                    {sub.title}
                                </h3>
                                <div>
                                    {sub.criteria.map((c) => (
                                        <CriterionRow
                                            key={c.id}
                                            criterion={c}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>
                ))}

                {/* Scoring & Certification */}
                <section id="scoring" className="mb-20 scroll-mt-24">
                    <div className="border-b-2 border-ink pb-4 mb-8">
                        <h2 className="text-3xl">
                            Scoring &amp; Certification
                        </h2>
                    </div>

                    <div className="space-y-8 mb-12">
                        <div>
                            <h3 className="text-base font-medium mb-2 font-sans">
                                Must-Pass Gate
                            </h3>
                            <p className="text-sm text-ink-muted leading-relaxed max-w-xl">
                                There are 27 must-pass criteria across all
                                domains. A product that fails any single
                                must-pass criterion cannot receive certification
                                at any tier, regardless of total score.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-base font-medium mb-2 font-sans">
                                Point Scoring
                            </h3>
                            <p className="text-sm text-ink-muted leading-relaxed max-w-xl">
                                The 77 scored criteria total 143 possible
                                points. 3 points for criteria requiring
                                significant investment or representing
                                industry-leading practice. 2 points for strong
                                practice achievable with moderate effort. 1
                                point for good hygiene achievable with minimal
                                effort.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-base font-medium mb-2 font-sans">
                                Domain Minimums
                            </h3>
                            <p className="text-sm text-ink-muted leading-relaxed max-w-xl">
                                QSF Certified and QSF Exemplary tiers require a
                                minimum of 40% of available scored points in
                                every domain. A product cannot compensate for
                                poor data practices with excellent notification
                                design.
                            </p>
                        </div>
                    </div>

                    {/* Tiers */}
                    <h3 className="text-base font-medium mb-4 font-sans">
                        Certification Tiers
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4 mb-12">
                        <div className="p-6 rounded-lg border border-ink/10 bg-paper-warm">
                            <p className="text-base font-medium mb-1">
                                QSF Verified
                            </p>
                            <p className="text-xs text-clay font-medium mb-3">
                                57+ of 143 points (40%)
                            </p>
                            <p className="text-sm text-ink-muted leading-relaxed">
                                Meets baseline ethical standards. No exploitative
                                patterns. All 27 must-pass criteria satisfied.
                            </p>
                        </div>
                        <div className="p-6 rounded-lg border border-ink/10 bg-paper-warm">
                            <p className="text-base font-medium mb-1">
                                QSF Certified
                            </p>
                            <p className="text-xs text-clay font-medium mb-3">
                                86+ of 143 points (60%)
                            </p>
                            <p className="text-sm text-ink-muted leading-relaxed">
                                Active commitment to user respect across all
                                domains. Requires domain minimums.
                            </p>
                        </div>
                        <div className="p-6 rounded-lg border-2 border-clay bg-paper-warm">
                            <p className="text-base font-medium mb-1">
                                QSF Exemplary
                            </p>
                            <p className="text-xs text-clay font-medium mb-3">
                                114+ of 143 points (80%)
                            </p>
                            <p className="text-sm text-ink-muted leading-relaxed">
                                Industry-leading attention-respecting software.
                                Reference implementation.
                            </p>
                        </div>
                    </div>

                    {/* Evidence Types */}
                    <h3 className="text-base font-medium mb-2 font-sans">
                        Audit Evidence Types
                    </h3>
                    <p className="text-sm text-ink-muted leading-relaxed max-w-xl mb-4">
                        Each criterion specifies one of four evidence methods,
                        ensuring two independent auditors reach the same
                        conclusion.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        {[
                            { code: "T", label: "Technical Inspection", desc: "Auditor examines the running application, source code, or network traffic." },
                            { code: "D", label: "Documentation Review", desc: "Auditor reviews published policies, changelogs, or support documentation." },
                            { code: "U", label: "User Journey Walkthrough", desc: "Auditor completes a specific user flow and records the experience." },
                            { code: "A", label: "Declarative Attestation", desc: "Company attests to practices that cannot be externally verified. False attestation voids certification." },
                        ].map((e) => (
                            <div key={e.code} className="flex gap-3">
                                <span className="text-2xl font-medium text-clay w-7 shrink-0 font-serif">
                                    {e.code}
                                </span>
                                <div>
                                    <p className="text-sm font-medium mb-0.5">
                                        {e.label}
                                    </p>
                                    <p className="text-sm text-ink-muted leading-relaxed">
                                        {e.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recertification */}
                    <h3 className="text-base font-medium mb-2 font-sans">
                        Recertification
                    </h3>
                    <p className="text-sm text-ink-muted leading-relaxed max-w-xl">
                        Certification is valid for 12 months. Recertification
                        requires a delta audit covering criteria affected by
                        product changes, plus a random sample of 20% of
                        unchanged criteria. Material product changes &mdash; new
                        monetization model, new data collection, or acquisition
                        by another company &mdash; trigger mandatory re-audit of
                        affected domains.
                    </p>
                </section>

                {/* Footer */}
                <div className="border-t border-ink/10 pt-8">
                    <p className="text-sm text-ink-muted mb-4">
                        <span className="text-ink font-medium">
                            The Quiet Standards Framework
                        </span>{" "}
                        is published by Hi-Low Studio LLC. The specification is
                        open. The self-audit toolkit is free. Certification is
                        earned.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a
                            href="/qsf-v1.pdf"
                            download
                            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-clay text-paper text-sm font-medium hover:bg-clay-muted focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
                        >
                            Download PDF
                        </a>
                        <Link
                            href="/standards"
                            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-ink/10 text-ink text-sm font-medium hover:border-ink/20 focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
                        >
                            Back to Standards Overview
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
