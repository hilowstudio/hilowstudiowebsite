"use client";

import { motion } from "framer-motion";

const steps = [
    {
        title: "Discovery Call",
        description:
            "A 30-minute conversation to understand where you are and where you want to be. We'll talk about your workflows, your tools, and what's not working. Free. No pitch.",
    },
    {
        title: "Recommendation",
        description:
            "Within a few days, you'll receive a clear write-up: what we'd do, how long it would take, and what it costs. If it's not the right fit, we'll tell you.",
    },
    {
        title: "Delivery",
        description:
            "We build, teach, or design, depending on what you need. You get working systems, documentation, and full ownership. Nothing is locked behind our account.",
    },
    {
        title: "Support",
        optional: true,
        description:
            "Monthly retainer for ongoing maintenance, iteration, and new builds as your needs evolve.",
    },
];

export function ConsultingProcess() {
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
                        The Process
                    </p>
                    <h2 className="text-3xl md:text-4xl">How We Work Together</h2>
                </motion.div>

                <div className="max-w-2xl space-y-12">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.6,
                                delay: 0.1 * index,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <span className="text-xs uppercase tracking-widest text-clay mb-4 block">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <h3 className="text-lg mb-2">
                                {step.title}
                                {step.optional && (
                                    <span className="text-sm text-ink-light font-normal ml-2">
                                        (optional)
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-ink-muted leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
