"use client";

import { motion } from "framer-motion";

export function AboutThroughline() {
    return (
        <section className="py-24 bg-paper-warm">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl"
                >
                    <p className="text-xs uppercase tracking-widest text-ink-light mb-6">
                        The Throughline
                    </p>
                    <h2 className="text-3xl md:text-4xl mb-8">
                        Every Job I Ever Loved Was the Same Act
                    </h2>
                    <div className="space-y-6 text-ink-muted leading-relaxed">
                        <p>
                            Every chapter of my career has been a version of the same act:
                            gathering people around a mission, teaching complex things
                            in accessible ways, and building the quiet infrastructure
                            that lets real care happen. Hi Low Studio is what happens when
                            I stop running those instincts on separate tracks and build
                            the whole thing from integration.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
