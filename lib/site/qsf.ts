// The Quiet Standards Framework, summarized for the /standards page.
// The full criteria live in components/standards/spec-content.tsx.

export const domains = [
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

export const tiers = [
    {
        name: "QSF Verified",
        threshold: "40%",
        points: "57+",
        description:
            "Meets baseline ethical standards. No exploitative patterns. All 27 must-pass criteria satisfied.",
    },
    {
        name: "QSF Certified",
        threshold: "60%",
        points: "86+",
        description:
            "Demonstrates active commitment to user respect across all domains. Requires domain minimums: strong notification design can\u2019t make up for weak data practices.",
    },
    {
        name: "QSF Exemplary",
        threshold: "80%",
        points: "114+",
        description:
            "Industry-leading attention-respecting software. Suitable as a reference implementation for others building in this space.",
    },
];

export const evidenceTypes = [
    {
        code: "T",
        label: "Technical Inspection",
        description: "Auditor examines the running application, source code, or network traffic.",
    },
    {
        code: "D",
        label: "Documentation Review",
        description: "Auditor reviews published policies, changelogs, or support documentation.",
    },
    {
        code: "U",
        label: "User Journey Walkthrough",
        description:
            "Auditor completes a specific user flow and records the experience step by step.",
    },
    {
        code: "A",
        label: "Declarative Attestation",
        description:
            "Company attests to practices that cannot be externally verified. False attestation voids certification.",
    },
];

export const landscape = [
    {
        label: "WCAG",
        status: "Auditable standard",
        scope: "Accessibility",
        note: "The gold standard for auditable design criteria. Proves this model works. It covers disability access only, leaving out attention, data sovereignty, dark patterns and engagement ethics.",
    },
    {
        label: "Calm Tech Institute",
        status: "81-point certification",
        scope: "Hardware",
        note: "Evaluates physical products across materials, light, and sound. Certified reMarkable, Mudita, Daylight Computer. No coverage for software UX, data portability, or engagement loops.",
    },
    {
        label: "GDPR Certification Marks",
        status: "Auditable certification",
        scope: "Data consent",
        note: "EuroPriSe and similar schemes certify data protection compliance. Covers consent-related dark patterns but not engagement design, notification ethics, or graceful offboarding.",
    },
    {
        label: "Center for Humane Technology",
        status: "Advocacy",
        scope: "Awareness",
        note: "Built massive public awareness around attention exploitation. Publishes frameworks and toolkits. Does not certify products or offer an auditable standard.",
    },
    {
        label: "IEEE 7000",
        status: "Process standard",
        scope: "Design process",
        note: "Tells organizations how to incorporate ethics into design. Audits the process, not the product. Cannot tell you whether an app\u2019s notifications respect your dinner.",
    },
    {
        label: "Norwegian Consumer Council",
        status: "Policy report",
        scope: "Regulation",
        note: "\u201CBreaking Free\u201D identifies enshittification and pushes for the EU Digital Fairness Act. It operates at the policy level, with no engineering criteria a developer can test against.",
    },
];
