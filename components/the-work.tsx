"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

const services = [
    {
        title: "Automation & Integration",
        description:
            "We build the systems that handle the operational work your team shouldn't be doing manually. Intake processing, CRM workflows, reporting pipelines, document generation, client onboarding sequences. Your tech stack, your data, no vendor lock-in.",
    },
    {
        title: "Calm AI Adoption",
        description:
            "We help founders and small teams think through AI and automation adoption the way you'd think through a hire: carefully, with clear scope, and with an honest assessment of what it costs in attention and autonomy as well as dollars.",
    },
    {
        title: "Training",
        description:
            "We run 1-on-1 and small group training for founders and SMB owners who want to build their own AI-assisted workflows and maintain them without a vendor. You leave with a working system, not a subscription.",
    },
];

export function TheWork() {
    return (
        <section className="py-24 bg-paper-warm">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-16 max-w-2xl"
                >
                    <p className="text-xs uppercase tracking-widest text-ink-light mb-6">
                        The Work
                    </p>
                    <h2 className="text-3xl md:text-4xl mb-4">
                        What We Do
                    </h2>
                    <p className="text-ink-muted leading-relaxed">
                        Most of our work is hands-on. We sit with founders and teams,
                        figure out what&apos;s actually draining their time and
                        attention, and build them the systems that take it off their
                        plate. Three shapes, all connected by the same philosophy.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 max-w-6xl">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.6,
                                delay: 0.1 * index,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="p-8 rounded-lg border border-ink/5 bg-paper"
                        >
                            <span className="text-xs uppercase tracking-widest text-clay mb-4 block">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <h3 className="text-lg mb-3">{service.title}</h3>
                            <p className="text-sm text-ink-muted leading-relaxed">
                                {service.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-12"
                >
                    <Link
                        href="/services"
                        className="group inline-flex items-center gap-2 text-sm text-ink hover:text-clay transition-colors duration-300"
                    >
                        <span>See all services</span>
                        <ArrowRight
                            weight="light"
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
