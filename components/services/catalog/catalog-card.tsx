"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";
import { CatalogItem, categoryMeta } from "@/lib/catalog";

interface CatalogCardProps {
    item: CatalogItem;
    index: number;
}

export function CatalogCard({ item, index }: CatalogCardProps) {
    const ctaLabel =
        item.cta.ctaLabel ??
        (item.cta.kind === "buy" ? "Buy now" : "Start a conversation");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: 0.05 * index,
                ease: [0.22, 1, 0.36, 1],
            }}
            layout
        >
            <Link
                href={`/services/catalog/${item.slug}`}
                className="group relative block p-8 rounded-lg border border-ink/10 bg-paper hover:bg-paper-warm transition-all duration-500 hover:shadow-md h-full"
            >
                <span className="inline-block text-xs uppercase tracking-widest text-clay mb-4">
                    {categoryMeta[item.category].label}
                </span>

                <h3 className="text-xl mb-2 group-hover:text-clay transition-colors duration-300">
                    {item.name}
                </h3>

                <p className="text-ink-light text-sm leading-relaxed mb-6">
                    {item.summary}
                </p>

                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-lg font-medium text-ink">
                            {item.price}
                        </p>
                        {item.priceNote && (
                            <p className="text-xs text-ink-light mt-1">
                                {item.priceNote}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-ink-muted group-hover:text-clay transition-colors duration-300 pb-1">
                        <span>{ctaLabel}</span>
                        <ArrowUpRight
                            weight="regular"
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
