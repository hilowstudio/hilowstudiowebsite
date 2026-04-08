"use client";

import { motion } from "framer-motion";

export function PhilosophyHero() {
    return (
        <section className="py-24 md:py-32">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl"
                >
                    <p className="text-sm text-ink-muted mb-6">
                        Why we build this way
                    </p>
                    <h1 className="text-4xl md:text-5xl mb-8">
                        The Quiet Exodus and the Parallel Economy
                    </h1>
                    <div className="space-y-6 text-ink-muted leading-relaxed">
                        <p>
                            Most software is optimized to extract as much of your
                            attention as it can, for as long as it can, on behalf of
                            a business model that depends on your distraction. We are
                            building the opposite.
                        </p>
                        <p>
                            This page is the long version of why. Read it if you want
                            the full thinking behind the calm tech practice, the
                            products we ship, and the way we work with clients.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
