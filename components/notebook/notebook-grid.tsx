"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// Sample entries - these would come from MDX files in production
const entries = [
    {
        slug: "the-quiet-exodus",
        title: "The Quiet Exodus",
        excerpt:
            "When I look around, I see 40-somethings and their families slowly decoupling from the systems that defined the 20th century.",
        date: "January 2026",
        category: "Philosophy",
    },
    {
        slug: "why-calm-tech",
        title: "Why Calm Tech",
        excerpt:
            "The attention economy has trained us to expect software that screams for our time. What if we built tools that whispered instead?",
        date: "December 2025",
        category: "Design",
    },
    {
        slug: "building-quill-compass",
        title: "Building Quill & Compass",
        excerpt:
            "A build log of our homeschool OS. The decisions we made, the patterns we followed, and the mistakes we learned from.",
        date: "November 2025",
        category: "Build Log",
    },
    {
        slug: "death-care-movement",
        title: "The Death Care Movement",
        excerpt:
            "There's a growing community of people who believe death should be dignified, personal, and connected to the earth.",
        date: "October 2025",
        category: "Research",
    },
    {
        slug: "data-sovereignty",
        title: "What Data Sovereignty Means",
        excerpt:
            "You own your records, not us. But what does that actually mean in practice? How do you build for portability?",
        date: "September 2025",
        category: "Technical",
    },
];

export function NotebookGrid() {
    return (
        <section className="pb-24">
            <div className="container-calm">
                {/* Masonry-style grid */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {entries.map((entry, index) => (
                        <motion.article
                            key={entry.slug}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.5,
                                delay: 0.05 * index,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="break-inside-avoid"
                        >
                            <Link
                                href={`/notebook/${entry.slug}`}
                                className="group block p-6 rounded-lg border border-ink/5 bg-paper hover:bg-paper-warm transition-colors duration-300"
                            >
                                {/* Handwritten-style date */}
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-xs italic text-ink-light">
                                        {entry.date}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-ink/10" />
                                    <span className="text-xs text-clay">
                                        {entry.category}
                                    </span>
                                </div>

                                {/* Title */}
                                <h2 className="text-xl mb-3 group-hover:text-clay transition-colors duration-300">
                                    {entry.title}
                                </h2>

                                {/* Excerpt */}
                                <p className="text-sm text-ink-muted leading-relaxed">
                                    {entry.excerpt}
                                </p>

                                {/* Torn edge decoration */}
                                <div className="mt-4 h-px bg-gradient-to-r from-ink/5 via-ink/10 to-ink/5" />
                            </Link>
                        </motion.article>
                    ))}
                </div>

                {/* Coming soon note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-center text-xs text-ink-light mt-12 italic"
                >
                    More entries coming. Subscribe to the newsletter for updates.
                </motion.p>
            </div>
        </section>
    );
}
