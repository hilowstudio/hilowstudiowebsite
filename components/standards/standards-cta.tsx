"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function StandardsCTA() {
    return (
        <section className="py-24">
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
                        Build Software Worth Certifying
                    </h2>

                    <p className="text-ink-muted leading-relaxed mb-6 max-w-lg mx-auto">
                        Whether you want to self-audit against the framework,
                        bring us in to evaluate your product, or work together
                        to remediate what you find &mdash; we are here for builders
                        who believe attention is worth protecting.
                    </p>

                    <p className="text-sm text-ink-muted leading-relaxed mb-12 max-w-lg mx-auto">
                        The full specification is open. The self-audit toolkit is
                        free. Certification is earned.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/standards/spec"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-clay text-paper text-sm font-medium hover:bg-clay-muted focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
                        >
                            Read the Full Specification
                        </Link>
                        <Link
                            href="/book"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-ink/10 text-ink text-sm font-medium hover:border-ink/20 focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
                        >
                            Book an Audit Consultation
                        </Link>
                    </div>

                    <div className="w-12 h-px bg-ink/20 mx-auto mt-12" />
                </motion.div>
            </div>
        </section>
    );
}
