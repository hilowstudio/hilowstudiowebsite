"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function ConsultingCTA() {
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
                        Let&apos;s Talk About Your Systems
                    </h2>

                    <p className="text-ink-muted leading-relaxed mb-12 max-w-lg mx-auto">
                        If you are spending your days on tasks a machine could handle,
                        we should have a conversation. The first call is always free.
                    </p>

                    <Link
                        href="/book"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-clay text-paper text-sm font-medium hover:bg-clay-muted focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
                    >
                        Book a Discovery Call
                    </Link>

                    <div className="w-12 h-px bg-ink/20 mx-auto mt-12" />
                </motion.div>
            </div>
        </section>
    );
}
