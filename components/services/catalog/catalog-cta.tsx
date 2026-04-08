"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CatalogCTA() {
    return (
        <section className="py-24 bg-paper-warm">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl mx-auto text-center"
                >
                    <div className="w-12 h-px bg-ink/20 mx-auto mb-12" />

                    <h2 className="text-3xl md:text-4xl mb-8">
                        Don&apos;t See What You Need?
                    </h2>

                    <p className="text-ink-muted leading-relaxed mb-12 max-w-lg mx-auto">
                        The catalog covers the work that has shape. If your problem
                        needs something custom, we still build that — start a
                        bespoke conversation and we&apos;ll figure it out together.
                    </p>

                    <Link
                        href="/services/bespoke"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-clay text-paper text-sm font-medium hover:bg-clay-muted focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
                    >
                        Talk About a Bespoke Engagement
                    </Link>

                    <div className="w-12 h-px bg-ink/20 mx-auto mt-12" />
                </motion.div>
            </div>
        </section>
    );
}
