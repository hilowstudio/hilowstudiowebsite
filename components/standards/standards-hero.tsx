"use client";

import { motion } from "framer-motion";

export function StandardsHero() {
    return (
        <section className="py-24 md:py-32">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl"
                >
                    <p className="text-sm text-ink-muted mb-6">
                        The Quiet Standards Framework
                    </p>
                    <h1 className="text-4xl md:text-5xl mb-8">
                        An Auditable Standard for Attention-Respecting Software
                    </h1>
                    <div className="space-y-6 text-ink-muted leading-relaxed">
                        <p>
                            Accessibility has WCAG. Privacy has GDPR. Hardware
                            has the Calm Tech Institute. But there is no
                            equivalent standard for how software treats your
                            attention, your data, or your right to leave.
                        </p>
                        <p>
                            The Quiet Standards Framework is the first open,
                            auditable, product-level specification for
                            attention-respecting software. 104 criteria across
                            7 domains. 27 must-pass gates. 143 scorable points. Designed so two
                            independent auditors reach the same conclusion.
                        </p>
                        <p className="text-ink font-medium">
                            Built by the team that ships calm technology
                            every day &mdash; not as theory, but as
                            engineering practice.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
