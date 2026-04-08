"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    CatalogItem,
    CatalogCategory,
    categoryMeta,
    categoryOrder,
} from "@/lib/catalog";
import { CatalogCard } from "./catalog-card";

type Filter = "all" | CatalogCategory;

interface CatalogGridProps {
    items: CatalogItem[];
}

export function CatalogGrid({ items }: CatalogGridProps) {
    const [filter, setFilter] = useState<Filter>("all");

    const filtered = useMemo(() => {
        if (filter === "all") return items;
        return items.filter((item) => item.category === filter);
    }, [items, filter]);

    return (
        <section className="pb-24">
            <div className="container-calm">
                {/* Filter tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-wrap gap-2 mb-12 pb-6 border-b border-ink/5"
                >
                    <FilterButton
                        active={filter === "all"}
                        onClick={() => setFilter("all")}
                    >
                        All
                    </FilterButton>
                    {categoryOrder.map((category) => (
                        <FilterButton
                            key={category}
                            active={filter === category}
                            onClick={() => setFilter(category)}
                        >
                            {categoryMeta[category].label}
                        </FilterButton>
                    ))}
                </motion.div>

                {/* Grid */}
                <motion.div
                    layout
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filtered.map((item, index) => (
                            <CatalogCard
                                key={item.slug}
                                item={item}
                                index={index}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filtered.length === 0 && (
                    <p className="text-center text-ink-muted py-16">
                        Nothing in this category yet.
                    </p>
                )}
            </div>
        </section>
    );
}

function FilterButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                active
                    ? "bg-clay text-paper"
                    : "bg-paper-muted text-ink-muted hover:bg-paper-warm hover:text-ink"
            }`}
        >
            {children}
        </button>
    );
}
