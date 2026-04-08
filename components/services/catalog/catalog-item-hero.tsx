"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";
import { CatalogItem, categoryMeta } from "@/lib/catalog";

interface CatalogItemHeroProps {
    item: CatalogItem;
}

export function CatalogItemHero({ item }: CatalogItemHeroProps) {
    return (
        <section className="py-24 md:py-32">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-3xl"
                >
                    <Link
                        href="/services/catalog"
                        className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-clay transition-colors duration-300 mb-8"
                    >
                        <ArrowLeft weight="regular" className="w-4 h-4" />
                        <span>Back to the catalog</span>
                    </Link>

                    <p className="inline-block text-xs uppercase tracking-widest text-clay mb-6">
                        {categoryMeta[item.category].label}
                    </p>

                    <h1 className="text-4xl md:text-5xl mb-6">{item.name}</h1>

                    <p className="text-lg text-ink-muted leading-relaxed mb-8 max-w-2xl">
                        {item.summary}
                    </p>

                    <div className="flex flex-wrap items-baseline gap-3 pt-6 border-t border-ink/10">
                        <p className="text-3xl font-medium text-ink">
                            {item.price}
                        </p>
                        {item.priceNote && (
                            <p className="text-sm text-ink-light">
                                {item.priceNote}
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
