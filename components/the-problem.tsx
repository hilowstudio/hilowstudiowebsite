"use client";

import { motion } from "framer-motion";

const stats = [
    {
        figure: "210M",
        description:
            "people worldwide meet clinical criteria for social media addiction.",
    },
    {
        figure: "50%",
        description:
            "of teenagers report feeling addicted to their phones.",
    },
    {
        figure: "70%",
        description:
            "increase in teen depression and anxiety since the rise of smartphones.",
    },
];

export function TheProblem() {
    return (
        <section className="py-24">
            <div className="container-calm">
                {/* Prose */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl mb-16"
                >
                    <p className="text-xs uppercase tracking-widest text-ink-light mb-6">
                        The Problem
                    </p>

                    <h2 className="text-3xl md:text-4xl mb-8">
                        The Attention Economy Is Working as Intended
                    </h2>

                    <div className="space-y-6 text-ink-muted leading-relaxed">
                        <p>
                            The exhaustion you feel is not a bug. It is a business model.
                        </p>
                        <p>
                            Big Tech traps us in walled gardens. It deploys deceptive design
                            patterns, infinite scrolls, and algorithmic feeds to harvest our
                            attention. It modifies products remotely after we buy them,
                            inserting paywalls, locking features behind subscriptions, and
                            disabling functionality at will. We are nudged, manipulated, and
                            surveilled by the same screens that were supposed to connect us.
                        </p>
                        <p>
                            The writer Cory Doctorow calls this process
                            "enshittification" — the deliberate, systematic degradation of
                            digital services to extract maximum time, money, and data from
                            the people who use them. Consumers cannot leave these walled-in
                            fiefdoms if there are no viable alternatives to move to.
                        </p>
                        <p className="text-ink font-medium">
                            They called for alternatives. We are building them.
                        </p>
                    </div>
                </motion.div>

                {/* Statistics */}
                <div className="max-w-4xl">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="text-xs uppercase tracking-widest text-ink-light mb-6"
                    >
                        The Human Cost
                    </motion.p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.figure}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.1 * index,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="p-8 rounded-lg border border-ink/5 bg-paper-warm"
                            >
                                <p className="text-3xl md:text-4xl text-clay mb-4">
                                    {stat.figure}
                                </p>
                                <p className="text-sm text-ink-muted leading-relaxed">
                                    {stat.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-ink text-sm mt-8 font-medium"
                    >
                        These are not statistics about someone else's children. These are
                        our children. Our households. Our attention spans. Our dinner tables.
                    </motion.p>
                </div>
            </div>
        </section>
    );
}
