"use client";

import { motion } from "framer-motion";

export function ServicesHero() {
    return (
        <section className="py-24 md:py-32">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl"
                >
                    <p className="text-sm text-ink-muted mb-6">Services</p>
                    <h1 className="text-4xl md:text-5xl mb-8">
                        Two Ways to Work With Us
                    </h1>
                    <div className="space-y-6 text-ink-muted leading-relaxed">
                        <p>
                            Some problems need a system designed from scratch around
                            how you actually work. Others have already been solved
                            enough times that we can hand you a calm, durable answer
                            without a long discovery process.
                        </p>
                        <p className="text-ink font-medium">
                            Both doors lead to the same kind of work: small,
                            durable, attention-respecting software you own.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
