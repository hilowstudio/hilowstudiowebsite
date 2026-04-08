"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

const doors = [
    {
        title: "Bespoke Engagements",
        description:
            "Scoped-to-you consulting, built around your actual work. Start with a free discovery call.",
        href: "/services/bespoke",
        cta: "See bespoke services",
    },
    {
        title: "The Catalog",
        description:
            "Fixed-scope offerings from downloadable Claude Code routines to full productized builds.",
        href: "/services/catalog",
        cta: "Browse the catalog",
    },
];

export function AboutClose() {
    return (
        <section className="py-24">
            <div className="container-calm">
                {/* Working with me */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-16 max-w-2xl"
                >
                    <p className="text-xs uppercase tracking-widest text-ink-light mb-6">
                        Working Together
                    </p>
                    <h2 className="text-3xl md:text-4xl mb-6">
                        If You&apos;re Here to Work Together
                    </h2>
                    <p className="text-ink-muted leading-relaxed">
                        If you&apos;re here because you want to work together, there
                        are two front doors.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mb-12">
                    {doors.map((door, index) => (
                        <motion.div
                            key={door.href}
                            initial={{ opacity: 0, y: 20 }}
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
                                className="group block p-8 rounded-lg border border-ink/10 bg-paper hover:bg-paper-warm transition-all duration-500 hover:shadow-md h-full"
                            >
                                <h3 className="text-xl mb-3 group-hover:text-clay transition-colors duration-300">
                                    {door.title}
                                </h3>
                                <p className="text-sm text-ink-muted leading-relaxed mb-6">
                                    {door.description}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-ink-muted group-hover:text-clay transition-colors duration-300">
                                    <span>{door.cta}</span>
                                    <ArrowRight
                                        weight="light"
                                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                                    />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl mb-24"
                >
                    <p className="text-sm text-ink-muted leading-relaxed">
                        If neither of those fits, the simplest thing is to{" "}
                        <a
                            href="mailto:hello@hilowstudio.dev"
                            className="text-ink hover:text-clay transition-colors duration-300 underline underline-offset-4 decoration-ink/20 hover:decoration-clay"
                        >
                            email me directly
                        </a>{" "}
                        or{" "}
                        <Link
                            href="/contact"
                            className="text-ink hover:text-clay transition-colors duration-300 underline underline-offset-4 decoration-ink/20 hover:decoration-clay"
                        >
                            send a note through the contact form
                        </Link>
                        . I read every message.
                    </p>
                </motion.div>

                {/* Who this is for */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl"
                >
                    <div className="w-12 h-px bg-ink/20 mb-12" />
                    <p className="text-xs uppercase tracking-widest text-ink-light mb-6">
                        A Note on Who This Studio Is For
                    </p>
                    <div className="space-y-6 text-ink-muted leading-relaxed">
                        <p>
                            I am not trying to be everyone&apos;s guy. Hi Low
                            Studio is for people who are already partway out of the
                            institutional systems that defined the last century
                            &mdash; homeschooling parents, death care practitioners,
                            solo builders, founders trying to hold a line on their own
                            attention, anyone who wants tools that serve their life
                            instead of consuming it.
                        </p>
                        <p className="text-ink font-medium">
                            If that describes you, I hope this place feels like home.
                        </p>
                    </div>
                    <p className="mt-12 text-ink">&mdash; Adam</p>
                </motion.div>
            </div>
        </section>
    );
}
