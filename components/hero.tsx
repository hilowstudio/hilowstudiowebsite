"use client";

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
                        There is a quiet exodus happening. People are choosing agency over
                        convenience, simplicity over scale. They need better tools. We
                        build calm technology that solves the problem, then gets out of
                        your way.
                    </motion.p>

                    {/* Subtle decorative element */}
                    <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{
                            duration: 1,
                            delay: 0.5,
                            ease: [0.22, 1, 0.36, 1]
                        }}
                        className="w-24 h-px bg-ink/20 mx-auto"
                    />
                </div>
            </div>
        </section>
    );
}
