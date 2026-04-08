"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";

const doors = [
    {
        eyebrow: "Bespoke Engagements",
        href: "/services/bespoke",
        title: "Built Around Your Work",
        tagline: "For founders and teams with a specific problem.",
        description:
            "We start with a discovery call, write a recommendation, and then build, teach, or design exactly what you need. Every engagement is scoped to the person across the table.",
        bullets: [
            "30-minute discovery call, free, no pitch",
            "Written recommendation before any work begins",
            "You own the code, the data, and the deployment",
        ],
        cta: "See bespoke services",
    },
    {
        eyebrow: "The Catalog",
        href: "/services/catalog",
        title: "Calm Tech, Off the Shelf",
        tagline: "For founders who already know what they want.",
        description:
            "A small set of fixed-scope offerings — custom builds, workshops, advisory retainers, and audits. Some you can purchase directly, others start with a short conversation.",
        bullets: [
            "Fixed scope, transparent pricing",
            "Custom builds you own, deployed to your own infrastructure",
            "Workshops, advisory, and Quiet Standards audits",
        ],
        cta: "Browse the catalog",
    },
];

export function ServicesTwoDoors() {
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
                        Choose Your Door
                    </p>
                    <h2 className="text-3xl md:text-4xl mb-4">
                        Bespoke or Catalog
                    </h2>
                    <p className="text-ink-muted max-w-xl">
                        Same philosophy, two front doors. If you&apos;re not sure which
                        one fits, start a conversation and we&apos;ll point you to the
                        right one.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
                    {doors.map((door, index) => (
                        <motion.div
                            key={door.href}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.6,
                                delay: 0.1 * index,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <Link
                                href={door.href}
                                className="group relative block p-8 rounded-lg border border-ink/10 bg-paper hover:bg-paper-warm transition-all duration-500 hover:shadow-md h-full"
                            >
                                <span className="inline-block text-xs uppercase tracking-widest text-clay mb-4">
                                    {door.eyebrow}
                                </span>

                                <h3 className="text-2xl mb-2 group-hover:text-clay transition-colors duration-300">
                                    {door.title}
                                </h3>

                                <p className="text-ink-muted text-sm mb-4">
                                    {door.tagline}
                                </p>

                                <p className="text-ink-light text-sm leading-relaxed mb-6">
                                    {door.description}
                                </p>

                                <ul className="space-y-2 mb-8">
                                    {door.bullets.map((bullet) => (
                                        <li
                                            key={bullet}
                                            className="text-sm text-ink-muted leading-relaxed pl-4 relative"
                                        >
                                            <span className="absolute left-0 top-2.5 w-1 h-1 rounded-full bg-clay/60" />
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex items-center gap-2 text-sm text-ink-muted group-hover:text-clay transition-colors duration-300">
                                    <span>{door.cta}</span>
                                    <ArrowUpRight
                                        weight="regular"
                                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                    />
                                </div>

                                <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-clay/30" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
