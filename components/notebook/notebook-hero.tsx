"use client";

import { motion } from "framer-motion";

export function NotebookHero() {
    return (
        <section className="py-24 md:py-32">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl"
                >
                    <p className="text-sm text-ink-muted mb-6">The Notebook</p>
                    <h1 className="text-4xl md:text-5xl mb-8">
                        Thinking Out Loud
                    </h1>
                    <p className="text-ink-muted leading-relaxed">
                        Essays, reflections, and build logs from the studio. No SEO
                        optimization, no engagement hacks—just honest thinking about
                        building for the parallel economy.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
