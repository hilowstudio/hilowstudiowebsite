"use client";

import { motion } from "framer-motion";

export function WorkHero() {
    return (
        <section className="py-24 md:py-32">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl"
                >
                    <p className="text-sm text-ink-muted mb-6">Our Projects</p>
                    <h1 className="text-4xl md:text-5xl mb-8">
                        Building the Rails
                    </h1>
                    <p className="text-ink-muted leading-relaxed max-w-xl">
                        The parallel economy needs better tools. We build across the
                        verticals where people are actively seeking alternatives, like education,
                        end-of-life care, and daily computing, because the future should be
                        quiet, and the software should get out of the way.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
