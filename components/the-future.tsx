"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function TheFuture() {
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
                        The Future Is Quiet
                    </h2>

                    <div className="space-y-6 text-ink-muted leading-relaxed mb-12">
                        <p>
                            It does not have to be a glowing screen that demands your
                            constant attention. It can be a calm display that helps your
                            family coordinate, and then fades into the background. A browser
                            that does not track you. A tool that helps you plan a school year
                            or navigate a hard goodbye and then closes without asking you
                            to rate it five stars.
                        </p>
                        <p>
                            The right amount of technology is the minimum needed. We build to
                            that standard.
                        </p>
                    </div>

                    <blockquote className="text-2xl md:text-3xl leading-snug mb-12">
                        "If you want software that serves your life instead of consuming
                        it, you are in the right place."
                    </blockquote>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/work"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-clay text-paper text-sm font-medium hover:bg-clay-muted focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
                        >
                            Our Projects
                        </Link>
                        <Link
                            href="/services"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-ink/10 text-ink text-sm font-medium hover:border-clay hover:text-clay focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
                        >
                            Work With Us
                        </Link>
                    </div>

                    <div className="mt-8">
                        <Link
                            href="/about"
                            className="text-sm text-ink-muted hover:text-clay transition-colors duration-300"
                        >
                            Or read a note from the founder &rarr;
                        </Link>
                    </div>

                    <div className="w-12 h-px bg-ink/20 mx-auto mt-12" />
                </motion.div>
            </div>
        </section>
    );
}
