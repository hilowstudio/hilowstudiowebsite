"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const domains = [
    {
        number: "01",
        title: "Attention",
        principle: "Design for the smallest possible amount of your attention",
        criteria: 23,
        mustPass: 6,
        areas: [
            "Notification architecture",
            "Engagement pattern prohibition",
            "Interface restraint",
        ],
        examples: [
            "No push notifications unless user-configured. Marketing/re-engagement = auto-fail.",
            "No infinite scroll. Feeds must terminate or paginate.",
            "No streaks, badges, leaderboards, or penalties for non-use.",
            "Default notifications are the minimum state. User opts in, not out.",
        ],
    },
    {
        number: "02",
        title: "Data Sovereignty",
        principle: "Your data belongs to you",
        criteria: 18,
        mustPass: 5,
        areas: [
            "Data portability",
            "Collection minimalism",
            "Security and deletion",
        ],
        examples: [
            "Full data export in open format (JSON, CSV, XML) within 3 clicks.",
            "Export includes ALL user-generated content, metadata, and history.",
            "Never sells or shares data with advertisers or data brokers.",
            "Account deletion is complete, permanent, and in-app.",
        ],
    },
    {
        number: "03",
        title: "Honesty",
        principle:
            "Amplify the best of people and technology without confusing the two",
        criteria: 16,
        mustPass: 5,
        areas: [
            "Dark pattern prohibition",
            "Algorithmic transparency",
            "Business model transparency",
        ],
        examples: [
            "No confirmshaming, roach motels, or bait-and-switch.",
            "Cancellation flow has no more steps than the signup flow.",
            "Monetization model stated plainly on marketing site and in-app.",
            "AI-generated content clearly labeled and distinguishable.",
        ],
    },
    {
        number: "04",
        title: "Departure",
        principle: "Solve the problem, then get out of your way",
        criteria: 12,
        mustPass: 4,
        areas: [
            "Session closure",
            "Account offboarding",
            "Graceful degradation",
        ],
        examples: [
            "No retention dialogs or emotional appeals when closing the app.",
            "Subscription cancellable entirely in-app. No phone calls or letters.",
            "After cancellation, data remains accessible and exportable for 30+ days.",
            "Documented plan for user data if company shuts down.",
        ],
    },
    {
        number: "05",
        title: "Respect",
        principle: "Respect your time and social norms",
        criteria: 14,
        mustPass: 3,
        areas: [
            "Temporal respect",
            "Contextual intelligence",
            "Resource respect",
        ],
        examples: [
            "No sensor access without explicit, revocable consent.",
            "Default notification times restricted to 8AM\u20139PM user-local.",
            "No crypto mining or unauthorized device resource usage.",
            "Just-in-time permission requests only, not all at first launch.",
        ],
    },
    {
        number: "06",
        title: "Durability",
        principle: "Software degrades gracefully",
        criteria: 12,
        mustPass: 3,
        areas: [
            "Accessibility",
            "Standards and interoperability",
            "Longevity",
        ],
        examples: [
            "WCAG 2.1 Level AA for all primary user flows.",
            "Minimum 44\u00d744px touch targets. Fully keyboard-navigable.",
            "Uses open web standards. No proprietary plugins for core function.",
            "Public changelog and stated support policy.",
        ],
    },
    {
        number: "07",
        title: "Governance",
        principle: "Transparent and verifiable",
        criteria: 9,
        mustPass: 1,
        areas: [
            "Privacy and legal clarity",
            "User communication",
            "Ethical commitments",
        ],
        examples: [
            "Privacy policy exists, accessible in-app, updated within 12 months.",
            "Plain-language privacy summary at 8th-grade reading level.",
            "All third-party SDKs and trackers identified with data practices.",
            "Funding sources publicly disclosed.",
        ],
    },
];

export function StandardsDomains() {
    return (
        <section className="py-24">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-16"
                >
                    <p className="text-xs uppercase tracking-widest text-ink-light mb-6">
                        The Specification
                    </p>
                    <h2 className="text-3xl md:text-4xl mb-4">
                        7 Domains. 104 Criteria.
                    </h2>
                    <p className="text-ink-muted max-w-xl mb-6">
                        Each domain maps to a core conviction about how software
                        should treat the people who use it. Every criterion is
                        specific enough that two independent auditors reach the
                        same conclusion.
                    </p>
                    <Link
                        href="/standards/spec"
                        className="inline-flex items-center text-sm text-clay hover:text-clay-muted transition-colors duration-300"
                    >
                        Read the full specification &rarr;
                    </Link>
                </motion.div>

                <div className="space-y-8 max-w-4xl">
                    {domains.map((domain, index) => (
                        <motion.div
                            key={domain.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.6,
                                delay: 0.05 * index,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="p-8 md:p-10 rounded-lg border border-ink/5 bg-paper-warm"
                        >
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                                <div>
                                    <span className="text-xs uppercase tracking-widest text-clay mb-3 block">
                                        Domain {domain.number}
                                    </span>
                                    <h3 className="text-2xl mb-2">
                                        {domain.title}
                                    </h3>
                                    <p className="text-sm text-ink-muted italic">
                                        &ldquo;{domain.principle}&rdquo;
                                    </p>
                                </div>
                                <div className="flex gap-6 text-sm text-ink-muted shrink-0">
                                    <div>
                                        <span className="text-ink font-medium text-lg">
                                            {domain.criteria}
                                        </span>{" "}
                                        criteria
                                    </div>
                                    <div>
                                        <span className="text-ink font-medium text-lg">
                                            {domain.mustPass}
                                        </span>{" "}
                                        must-pass
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-xs uppercase tracking-widest text-ink-light mb-3">
                                    Areas Evaluated
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {domain.areas.map((area) => (
                                        <span
                                            key={area}
                                            className="text-xs px-3 py-1.5 rounded-full border border-ink/10 text-ink-muted"
                                        >
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-widest text-ink-light mb-3">
                                    Example Criteria
                                </p>
                                <ul className="space-y-2">
                                    {domain.examples.map((example) => (
                                        <li
                                            key={example}
                                            className="text-sm text-ink-muted leading-relaxed flex gap-3"
                                        >
                                            <span className="text-clay shrink-0">
                                                &middot;
                                            </span>
                                            {example}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
