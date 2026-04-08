"use client";

import { motion } from "framer-motion";

export function AboutHonesty() {
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
                        Business Model
                    </p>
                    <h2 className="text-3xl md:text-4xl mb-8">
                        How Hi Low Stays Honest
                    </h2>
                    <div className="space-y-6 text-ink-muted leading-relaxed">
                        <p>
                            Hi Low Studio is bootstrapped. It is funded entirely by
                            consulting services and product sales. I do not sell data.
                            I do not run ads. I do not take investment that would
                            require me to optimize for growth curves I don&apos;t
                            believe in.
                        </p>
                        <p className="text-ink font-medium">
                            This is not a marketing claim. It is the material basis
                            for every calm-tech commitment I make on the rest of this
                            site. If that ever changes, I will say so on this page,
                            publicly, before it takes effect.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
