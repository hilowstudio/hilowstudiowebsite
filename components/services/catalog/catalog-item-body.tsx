"use client";

import { motion } from "framer-motion";
import { CatalogItem } from "@/lib/catalog";

interface CatalogItemBodyProps {
    item: CatalogItem;
}

export function CatalogItemBody({ item }: CatalogItemBodyProps) {
    return (
        <section className="py-16 bg-paper-warm">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-3xl"
                >
                    <p className="text-xs uppercase tracking-widest text-ink-light mb-6">
                        About This Offering
                    </p>
                    <div className="space-y-6 text-ink-muted leading-relaxed">
                        {item.description.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>

                    {item.outcomes && item.outcomes.length > 0 && (
                        <div className="mt-12 pt-12 border-t border-ink/10">
                            <p className="text-xs uppercase tracking-widest text-ink-light mb-6">
                                What You Walk Away With
                            </p>
                            <ul className="space-y-3">
                                {item.outcomes.map((outcome) => (
                                    <li
                                        key={outcome}
                                        className="text-ink leading-relaxed pl-5 relative"
                                    >
                                        <span className="absolute left-0 top-3 w-1.5 h-1.5 rounded-full bg-clay" />
                                        {outcome}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
