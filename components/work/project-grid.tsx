"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

const projects = [
    {
        name: "Hilow Browser",
        tagline: "A Cognitive Support Tool for the Desktop",
        description:
            "A desktop browser that treats your attention as something worth protecting. Designed primarily for people with ADHD, but for anyone who has ever opened a tab to check one thing and surfaced two hours later. Intent declarations, focus guardrails, impulse protection, and capacity tracking — calm technology in practice.",
        href: "/hilowbrowser",
        vertical: "Daily Computing",
        status: "Live Now",
        features: [
            "Intent Before Input",
            "Focus Guardrails",
            "Impulse Protection",
            "Capacity Tracking",
        ],
        external: false,
    },
    {
        name: "Podcatch",
        tagline: "Keep the Knowledge. Lose the Screen Time.",
        description:
            "Podcatch transcribes, summarizes, and organizes your podcast library so the knowledge comes to you \u2014 on your terms, in your time, in the tools you already use. No infinite scroll. No algorithmic feed. It processes new episodes in the background and waits until you're ready.",
        href: "/podcatch",
        website: "https://www.podcatch.app",
        vertical: "Media",
        status: "Live Now",
        features: [
            "Automatic Transcription",
            "AI-Powered Summaries",
            "Searchable Library",
            "True Data Portability",
        ],
        external: false,
    },
    {
        name: "Quill & Compass",
        tagline: "A Thoughtful Toolkit for the Modern Christian Homeschooling Family",
        description:
            "Homeschooling is one of the most radical acts of presence a parent can choose. Quill & Compass eliminates the blank page — lesson plans, differentiated worksheets, curriculum compilation, and a weekly planner, all built to get you back to your children.",
        href: "/quillandcompass",
        website: "https://www.quillandcompass.app",
        vertical: "Education",
        status: "In Beta until August 1, 2026",
        features: [
            "Curriculum Compiler",
            "Differentiated Learning",
            "Library-Based Materials",
            "Weekly Planner",
        ],
        external: false,
    },
    {
        name: "Kin & Cairn",
        tagline: "Digital Infrastructure for the Hardest Days",
        description:
            "The operating system for the post-institutional death care industry. Practice management for practitioners. A coordination hub for families and circles of care. A verified directory so the right guide can be found at the right time. Built for the bedside.",
        href: "/kinandcairn",
        vertical: "End of Life",
        status: "Coming Memorial Day 2026",
        features: [
            "Practice Management",
            "Family Coordination Hub",
            "Practitioner Directory",
            "Bedside-First Design",
        ],
        external: false,
    },
];

const projectImages: Record<string, string> = {
    "Hilow Browser": "/hilowbrowser.png",
    "Podcatch": "/podcatch.png",
    "Quill & Compass": "/quillandcompass.png",
    "Kin & Cairn": "/kinandcairn.png",
};

export function ProjectGrid() {
    return (
        <section className="pb-24">
            <div className="container-calm">
                <div className="space-y-12">
                    {projects.map((project, index) => {
                        const linkProps = project.external
                            ? { href: project.href, target: "_blank" as const, rel: "noopener noreferrer" }
                            : { href: project.href };

                        return (
                            <motion.article
                                key={project.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.1 * index,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="group grid lg:grid-cols-2 gap-8 p-8 md:p-12 rounded-lg border border-ink/10 bg-paper-warm/50 hover:bg-paper-warm transition-colors duration-500"
                            >
                                {/* Content */}
                                <div className="space-y-6">
                                    {/* Meta */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs uppercase tracking-widest text-clay">
                                            {project.vertical}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-ink/20" />
                                        <span className="text-xs text-ink-light">
                                            {project.status}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-3xl group-hover:text-clay transition-colors duration-300">
                                        {project.name}
                                    </h2>

                                    {/* Tagline */}
                                    <p className="text-ink-muted font-medium">
                                        {project.tagline}
                                    </p>

                                    {/* Description */}
                                    <p className="text-ink-light text-sm leading-relaxed">
                                        {project.description}
                                    </p>

                                    {/* Links */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        {project.external ? (
                                            <a
                                                {...linkProps}
                                                className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-clay transition-colors duration-300"
                                            >
                                                <span>Visit {project.name}</span>
                                                <ArrowUpRight
                                                    weight="regular"
                                                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                                />
                                            </a>
                                        ) : (
                                            <Link
                                                href={project.href}
                                                className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-clay transition-colors duration-300"
                                            >
                                                <span>Learn more</span>
                                                <ArrowUpRight
                                                    weight="regular"
                                                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                                />
                                            </Link>
                                        )}
                                        {project.website && (
                                            <a
                                                href={project.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-clay transition-colors duration-300"
                                            >
                                                <span>Visit site</span>
                                                <ArrowUpRight
                                                    weight="regular"
                                                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                                />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Image & Features */}
                                <div className="flex flex-col justify-center gap-8">
                                    <Image
                                        src={projectImages[project.name]}
                                        alt={project.name}
                                        width={160}
                                        height={160}
                                        className="block"
                                    />
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-ink-light mb-4">
                                            Key Features
                                        </p>
                                        <ul className="space-y-3">
                                            {project.features.map((feature) => (
                                                <li
                                                    key={feature}
                                                    className="flex items-center gap-3 text-sm text-ink-muted"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-clay/50" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
