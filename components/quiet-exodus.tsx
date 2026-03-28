"use client";

import { motion } from "framer-motion";

export function QuietExodus() {
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
                        The Shift
                    </p>

                    <h2 className="text-3xl md:text-4xl mb-8">
                        We Are Witnessing a Quiet Exodus
                    </h2>

                    <div className="space-y-6 text-ink-muted leading-relaxed">
                        <p>
                            All around us, people are decoupling from the institutional
                            systems that defined the 20th century. They are trading
                            standardized schooling for homeschooling, global supply chains
                            for local agriculture, corporate healthcare for direct primary
                            care, and legacy banking for decentralized finance.
                        </p>
                        <p>
                            These people are not Luddites. They appreciate the convenience
                            of modern technology. But they are exhausted by the systems that
                            deliver it. They want their agency back. Their simplicity. Their
                            data. And most of all, they want their attention back.
                        </p>
                        <p className="text-ink font-medium">
                            This post-institutional shift has a hardware problem: we are
                            trying to build a sovereign, analog life using software that was
                            engineered to addict us.
                        </p>
                    </div>

                    <div className="w-12 h-px bg-ink/20 mt-12" />
                </motion.div>
            </div>
        </section>
    );
}
