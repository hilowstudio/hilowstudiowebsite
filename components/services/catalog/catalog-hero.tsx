"use client";

import { motion } from "framer-motion";

export function CatalogHero() {
    return (
        <section className="py-24 md:py-32">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl"
                >
                    <p className="text-sm text-ink-muted mb-6">The Catalog</p>
                    <h1 className="text-4xl md:text-5xl mb-8">
                        Calm Tech, Off the Shelf
                    </h1>
                    <div className="space-y-6 text-ink-muted leading-relaxed">
                        <p>
                            A small set of fixed-scope offerings: custom builds you
                            own, workshops you can book, advisory retainers, and
                            Quiet Standards audits. Each one is designed to ship
                            quickly without sacrificing the things that make our
                            bespoke work feel like ours.
                        </p>
                        <p className="text-ink font-medium">
                            Some you can purchase directly. Others start with a
                            short conversation.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
