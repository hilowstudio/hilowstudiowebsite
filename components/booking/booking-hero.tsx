"use client";

import { motion } from "framer-motion";

export function BookingHero() {
    return (
        <section className="py-24 md:py-32">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl mx-auto text-center"
                >
                    <p className="text-sm text-ink-muted mb-6">Book a Call</p>
                    <h1 className="text-4xl md:text-5xl mb-8">
                        30 Minutes. No Pitch. No Pressure.
                    </h1>
                    <p className="text-ink-muted leading-relaxed max-w-lg mx-auto">
                        A free discovery call to understand your workflows and
                        goals. Pick a time that works for you, and we&apos;ll
                        send you a Google Meet link.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
