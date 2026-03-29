"use client";

import { motion } from "framer-motion";

const entries = [
    {
        date: "March 28, 2026",
        title: "Quiet Standards Framework Published",
        changes: [
            "Published the Quiet Standards Framework (QSF) — 104 auditable criteria for attention-respecting software",
            "Added /standards overview page with 7-domain breakdown",
            "Added /standards/spec for the full specification",
            "Added downloadable PDF of the specification",
            "Added QSF audit as a fourth service offering on the consulting page",
        ],
    },
    {
        date: "March 28, 2026",
        title: "Privacy and Transparency",
        changes: [
            "Added privacy policy at /privacy",
            "Added this changelog at /changelog",
            "Added business model and funding disclosure to site footer",
            "Added support response time commitment (2 business days)",
        ],
    },
    {
        date: "March 2026",
        title: "Initial Launch",
        changes: [
            "Launched hilowstudio.dev with homepage, product pages, consulting services, contact form, and discovery call booking",
            "Products featured: Quill & Compass, Kin & Cairn, Hilow Browser, Podcatch",
            "Services: Build (automations), Teach (knowledge systems), Design (calm technology)",
        ],
    },
];

export function ChangelogContent() {
    return (
        <article className="py-24 md:py-32">
            <div className="container-calm max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-16"
                >
                    <p className="text-sm text-ink-muted mb-6">
                        Transparency
                    </p>
                    <h1 className="text-4xl md:text-5xl mb-8">Changelog</h1>
                    <p className="text-ink-muted leading-relaxed">
                        What we&apos;ve added, changed, and removed.
                    </p>
                </motion.div>

                <div className="space-y-12">
                    {entries.map((entry, index) => (
                        <motion.div
                            key={entry.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.6,
                                delay: 0.1 * index,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="border-b border-ink/5 pb-12 last:border-b-0"
                        >
                            <p className="text-xs text-ink-light mb-3">
                                {entry.date}
                            </p>
                            <h2 className="text-xl mb-4">{entry.title}</h2>
                            <ul className="space-y-2">
                                {entry.changes.map((change) => (
                                    <li
                                        key={change}
                                        className="text-sm text-ink-muted leading-relaxed flex gap-3"
                                    >
                                        <span className="text-clay shrink-0">
                                            &mdash;
                                        </span>
                                        {change}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </article>
    );
}
