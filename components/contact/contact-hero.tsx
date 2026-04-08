"use client";

import { motion } from "framer-motion";

export function ContactHero() {
    return (
        <section className="py-24 md:py-32">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl"
                >
                    <p className="text-sm text-ink-muted mb-6">Contact</p>
                    <h1 className="text-4xl md:text-5xl mb-8">
                        Let's Build Something
                    </h1>
                    <p className="text-ink-muted leading-relaxed">
                        If you're building for the parallel economy (tools for sovereign
                        health, education, death care, or any of the other verticals), we'd
                        love to hear from you.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
