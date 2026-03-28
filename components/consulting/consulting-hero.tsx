"use client";

import { motion } from "framer-motion";

export function ConsultingHero() {
    return (
        <section className="py-24 md:py-32">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl"
                >
                    <p className="text-sm text-ink-muted mb-6">Services</p>
                    <h1 className="text-4xl md:text-5xl mb-8">
                        Run Your Business Without It Running Your Life
                    </h1>
                    <div className="space-y-6 text-ink-muted leading-relaxed">
                        <p>
                            The same principles that drive our products — minimum
                            attention, maximum presence — drive our services. We help
                            founders and small businesses build the systems that handle
                            the operational work, so they can spend their time on the
                            work that actually matters.
                        </p>
                        <p className="text-ink font-medium">
                            No bloated platforms. No vendor lock-in.
                            Systems you own, built once, useful forever.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
