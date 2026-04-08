"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

type ProductLink = { href: string; label: string };

type Part = {
    title: string;
    body: string[];
    productLinks?: ProductLink[];
    productBullets?: { link: ProductLink; description: string }[];
    footer?: string;
    link: { href: string; label: string };
};

const parts: Part[] = [
    {
        title: "Products",
        body: [
            "We build software for the verticals where people are actively leaving institutional systems behind. Four products are live or near-live:",
        ],
        productBullets: [
            {
                link: { href: "/hilowbrowser", label: "Hilow Browser" },
                description:
                    "a desktop browser built as a cognitive support tool, primarily for people with ADHD, that treats your attention as a limited resource worth protecting.",
            },
            {
                link: { href: "/podcatch", label: "Podcatch" },
                description:
                    "a podcast knowledge platform that transcribes, summarizes, and organizes your library so the knowledge comes to you without pulling you back to the screen.",
            },
            {
                link: { href: "/quillandcompass", label: "Quill & Compass" },
                description:
                    "a thoughtful toolkit for modern Christian homeschooling families, designed to get you back to your children instead of trapping you in another app.",
            },
            {
                link: { href: "/kinandcairn", label: "Kin & Cairn" },
                description:
                    "the operating system for the post-institutional death care industry, built for the bedside at 2am.",
            },
        ],
        footer:
            "Every product ships under the same commitments: design for the smallest possible amount of your attention, solve the problem then get out of the way, your data belongs to you.",
        link: { href: "/work", label: "See all four projects" },
    },
    {
        title: "Services",
        body: [
            "I take on bespoke engagements for founders and small teams who need this same philosophy applied to their own work, and I ship a catalog of fixed-scope offerings \u2014 Claude Code routines, productized builds, workshops, advisory retainers, and formal QSF audits \u2014 for people who already know what they want. This is how the lights stay on while the products mature, and it's how I bring Hi Low's approach into client environments that need it.",
        ],
        link: { href: "/services", label: "See services" },
    },
    {
        title: "The Quiet Standards Framework",
        body: [
            "I authored the QSF \u2014 the first open, auditable, product-level certification standard for attention-respecting software. 104 criteria across 7 domains. 27 must-pass gates. Designed so two independent auditors reach the same conclusion.",
            "The QSF is the intellectual anchor of everything else: it keeps the products honest, gives consulting engagements a rigorous standard to argue from, and makes it possible to talk about calm technology as a measurable practice rather than a vibe. It also ships as a Claude Code skill anyone can install and run themselves.",
        ],
        link: { href: "/standards", label: "Read the framework" },
    },
];

export function AboutCreature() {
    return (
        <section className="py-24">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-16 max-w-2xl"
                >
                    <p className="text-xs uppercase tracking-widest text-ink-light mb-6">
                        The Studio
                    </p>
                    <h2 className="text-3xl md:text-4xl mb-6">
                        Three Interlocking Parts
                    </h2>
                    <p className="text-ink-muted leading-relaxed">
                        Hi Low Studio is a calm tech practice with three interlocking
                        parts. None of them stands alone. Each one serves the others.
                    </p>
                </motion.div>

                <div className="max-w-2xl space-y-16">
                    {parts.map((part, index) => (
                        <motion.div
                            key={part.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                                duration: 0.6,
                                delay: 0.1 * index,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <span className="text-xs uppercase tracking-widest text-clay mb-4 block">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <h3 className="text-2xl mb-6">{part.title}</h3>
                            <div className="space-y-4 text-ink-muted leading-relaxed">
                                {part.body.map((paragraph, i) => (
                                    <p key={i}>{paragraph}</p>
                                ))}
                                {part.productBullets && (
                                    <ul className="space-y-3 mt-4">
                                        {part.productBullets.map((item) => (
                                            <li
                                                key={item.link.href}
                                                className="pl-5 relative"
                                            >
                                                <span className="absolute left-0 top-2.5 w-1.5 h-1.5 rounded-full bg-clay/60" />
                                                <Link
                                                    href={item.link.href}
                                                    className="text-ink hover:text-clay transition-colors duration-300 font-medium"
                                                >
                                                    {item.link.label}
                                                </Link>
                                                : {item.description}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {part.footer && <p className="pt-2">{part.footer}</p>}
                            </div>
                            <div className="mt-6">
                                <Link
                                    href={part.link.href}
                                    className="group/link inline-flex items-center gap-2 text-sm text-ink hover:text-clay transition-colors duration-300"
                                >
                                    <span>{part.link.label}</span>
                                    <ArrowRight
                                        weight="light"
                                        className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-0.5"
                                    />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-16 max-w-2xl"
                >
                    <div className="w-12 h-px bg-ink/20 mb-8" />
                    <p className="text-ink-muted leading-relaxed italic">
                        Each of these feeds the others. The products prove the QSF
                        isn&apos;t theory. The QSF keeps the products honest. The
                        consulting pays for the runway and pulls lessons back from
                        real client environments.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
