"use client";

import { motion } from "framer-motion";
import { CatalogItem } from "@/lib/catalog";

interface CatalogItemMetaProps {
    item: CatalogItem;
}

export function CatalogItemMeta({ item }: CatalogItemMetaProps) {
    const rows = [
        item.timeline && { label: "Timeline", value: item.timeline },
        item.scope && { label: "Scope", value: item.scope },
        item.prerequisites && {
            label: "Prerequisites",
            value: item.prerequisites,
        },
    ].filter(Boolean) as { label: string; value: string }[];

    if (rows.length === 0) return null;

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
                        The Shape of It
                    </p>
                    <dl className="space-y-6">
                        {rows.map((row) => (
                            <div
                                key={row.label}
                                className="grid md:grid-cols-4 gap-2 md:gap-6 pb-6 border-b border-ink/10 last:border-0 last:pb-0"
                            >
                                <dt className="text-sm font-medium text-ink">
                                    {row.label}
                                </dt>
                                <dd className="md:col-span-3 text-sm text-ink-muted leading-relaxed">
                                    {row.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </motion.div>
            </div>
        </section>
    );
}
