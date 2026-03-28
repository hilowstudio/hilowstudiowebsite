"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

const comparisons = [
    { institution: "Managed Health Care", alternative: "Sovereign Health" },
    { institution: "Standardized Schooling", alternative: "Intellectual Liberty" },
    { institution: "The Funeral Industry", alternative: "A Good Death" },
    { institution: "The Attention Economy", alternative: "Deep Work & Presence" },
    { institution: "Global Supply Chains", alternative: "Local Resilience" },
    { institution: "Fractional Reserve Banking", alternative: "Financial Sovereignty" },
    { institution: "Corporate Employment", alternative: "Maker Independence" },
    { institution: "Religious Bureaucracy", alternative: "Authentic Community" },
];

export function ParallelEconomy() {
    return (
        <section className="py-24 bg-paper-warm">
            <div className="container-calm">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl mb-4">
                        The Parallel Economy
                    </h2>
                    <p className="text-ink-muted measure mx-auto">
                        People are actively seeking alternatives across every vertical.
                        The parallel economy needs better rails, and we are laying them.
                    </p>
                </motion.div>

                {/* The Ledger */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-3xl mx-auto"
                >
                    {/* Ledger Header */}
                    <div className="grid grid-cols-2 gap-4 mb-2 px-4">
                        <span className="text-xs uppercase tracking-widest text-ink-light font-medium">
                            The Institution
                        </span>
                        <span className="text-xs uppercase tracking-widest text-clay font-medium text-right">
                            The Alternative
                        </span>
                    </div>

                    {/* Ledger Border */}
                    <div className="border border-ink/10 rounded-lg bg-paper shadow-sm overflow-hidden">
                        {comparisons.map((item, index) => (
                            <motion.div
                                key={item.institution}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.5,
                                    delay: 0.1 * index,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                                className={`
                  grid grid-cols-[1fr_auto_1fr] items-center gap-4 
                  px-6 py-4
                  ${index !== comparisons.length - 1 ? "border-b border-ink/5" : ""}
                  hover:bg-paper-warm/50 transition-colors duration-300
                `}
                            >
                                {/* Institution */}
                                <span className="text-ink-muted text-sm md:text-base">
                                    {item.institution}
                                </span>

                                {/* Arrow */}
                                <ArrowRight
                                    weight="light"
                                    className="w-4 h-4 text-ink-light flex-shrink-0"
                                />

                                {/* Alternative */}
                                <span className="text-ink font-medium text-sm md:text-base text-right">
                                    {item.alternative}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer Note */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="text-center text-xs text-ink-light mt-6 italic"
                    >
                        We aren't sending you back to the prairie. We're just providing options.
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
}
