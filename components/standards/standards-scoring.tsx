"use client";

import { motion } from "framer-motion";

const tiers = [
    {
        name: "QSF Verified",
        threshold: "40%",
        points: "54+",
        description:
            "Meets baseline ethical standards. No exploitative patterns. All 27 must-pass criteria satisfied.",
        color: "border-ink/20",
    },
    {
        name: "QSF Certified",
        threshold: "60%",
        points: "80+",
        description:
            "Demonstrates active commitment to user respect across all domains. Requires domain minimums \u2014 you cannot compensate for weak data practices with strong notification design.",
        color: "border-clay/40",
    },
    {
        name: "QSF Exemplary",
        threshold: "80%",
        points: "107+",
        description:
            "Industry-leading attention-respecting software. Suitable as a reference implementation for others building in this space.",
        color: "border-clay",
    },
];

const evidenceTypes = [
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

export function StandardsScoring() {
    return (
        <section className="py-24 bg-paper-warm">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-16"
                >
                    <p className="text-xs uppercase tracking-widest text-ink-light mb-6">
                        Scoring
                    </p>
                    <h2 className="text-3xl md:text-4xl mb-4">
                        How Certification Works
                    </h2>
                    <p className="text-ink-muted max-w-xl">
                        27 must-pass gates. 77 scored criteria totaling 134
                        points. Fail any must-pass and certification is denied at
                        every tier, regardless of total score. Must-pass criteria
                        are the line between ethical software and everything else.
                    </p>
                </motion.div>

                {/* Tiers */}
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mb-24">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.6,
                                delay: 0.1 * index,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className={`p-8 rounded-lg border-2 ${tier.color} bg-paper`}
                        >
                            <span className="text-xs uppercase tracking-widest text-clay mb-4 block">
                                {tier.threshold} of 134 points
                            </span>
                            <h3 className="text-lg mb-1">{tier.name}</h3>
                            <p className="text-sm text-ink-muted mb-4">
                                {tier.points} points required
                            </p>
                            <p className="text-sm text-ink-muted leading-relaxed">
                                {tier.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Evidence Types */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-4xl"
                >
                    <p className="text-xs uppercase tracking-widest text-ink-light mb-6">
                        Audit Methodology
                    </p>
                    <h3 className="text-2xl mb-4">
                        Four Evidence Types
                    </h3>
                    <p className="text-ink-muted max-w-xl mb-8">
                        Each criterion specifies how it is verified. The framework
                        is designed so two independent auditors reach the same
                        conclusion on every point.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        {evidenceTypes.map((type, index) => (
                            <motion.div
                                key={type.code}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.1 * index,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="flex gap-4"
                            >
                                <span className="text-2xl font-medium text-clay shrink-0 w-8">
                                    {type.code}
                                </span>
                                <div>
                                    <h4 className="text-sm font-medium mb-1">
                                        {type.label}
                                    </h4>
                                    <p className="text-sm text-ink-muted leading-relaxed">
                                        {type.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
