"use client";

import { motion } from "framer-motion";
import { Check } from "@phosphor-icons/react";
import { CatalogItem } from "@/lib/catalog";

interface CatalogItemIncludesProps {
    item: CatalogItem;
}

export function CatalogItemIncludes({ item }: CatalogItemIncludesProps) {
    return (
        <section className="py-16">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-3xl"
                >
                    <p className="text-xs uppercase tracking-widest text-ink-light mb-6">
                        What&apos;s Included
                    </p>
                    <ul className="space-y-4">
                        {item.includes.map((line) => (
                            <li
                                key={line}
                                className="flex items-start gap-3 text-ink leading-relaxed"
                            >
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-moss/15 flex items-center justify-center mt-0.5">
                                    <Check
                                        weight="bold"
                                        className="w-3.5 h-3.5 text-moss"
                                    />
                                </span>
                                <span>{line}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            </div>
        </section>
    );
}
