"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
    return (
        <section className="min-h-[75vh] flex items-center justify-center py-24">
            <div className="container-calm">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1]
                        }}
                        className="text-4xl md:text-5xl lg:text-5xl mb-8 tracking-tight"
                    >
                        Digital Supports for Analog Living.
                    </motion.h1>

                    {/* Subhead */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.2,
                            ease: [0.22, 1, 0.36, 1]
                        }}
                        className="text-lg md:text-xl text-ink-muted measure mx-auto mb-12 leading-relaxed"
                    >
                        Hi Low Studio is a calm tech practice. We help founders and
                        small teams use AI and automation to offload the operational
                        work, so they can spend their attention on the things that
                        actually matter.
                    </motion.p>

                    {/* Primary CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.4,
                            ease: [0.22, 1, 0.36, 1]
                        }}
                        className="mb-12"
                    >
                        <Link
                            href="/services"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-clay text-paper text-sm font-medium hover:bg-clay-muted focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
                        >
                            Work With Us
                        </Link>
                    </motion.div>

                    {/* Subtle decorative element */}
                    <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{
                            duration: 1,
                            delay: 0.6,
                            ease: [0.22, 1, 0.36, 1]
                        }}
                        className="w-24 h-px bg-ink/20 mx-auto"
                    />
                </div>
            </div>
        </section>
    );
}
