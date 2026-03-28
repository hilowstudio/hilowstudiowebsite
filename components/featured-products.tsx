"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";

const products = [
    {
        name: "Quill & Compass",
        tagline: "The OS for Modern Homeschooling",
        description:
            "A calm, comprehensive system for families choosing intellectual liberty. Curriculum planning, progress tracking, and portfolio building—without the overwhelm.",
        href: "https://quillandcompass.app",
        vertical: "Education",
    },
    {
        name: "Kin & Cairn",
        tagline: "A Digital Guild for Death Care",
        description:
            "Tools for the holistic death care movement. End-of-life planning, green burial resources, and community connection for those seeking a good death.",
        href: "https://kinandCairn.com",
        vertical: "End of Life",
    },
];

export function FeaturedProducts() {
    return (
        <section className="py-24 bg-paper-warm">
            <div className="container-calm">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl mb-4">
                        Two Verticals. Same Philosophy.
                    </h2>
                    <p className="text-ink-muted measure mx-auto">
                        Education and end-of-life care seem like opposite ends of the
                        spectrum, but they are the bookends of a life. Different users.
                        Same conviction: the tools should serve the human, not the other
                        way around.
                    </p>
                </motion.div>

                {/* Product Cards - Bento Grid */}
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {products.map((product, index) => (
                        <motion.a
                            key={product.name}
                            href={product.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.6,
                                delay: 0.1 * index,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="group relative block p-8 rounded-lg border border-ink/10 bg-paper hover:bg-paper-warm transition-all duration-500 hover:shadow-md"
                        >
                            {/* Vertical Badge */}
                            <span className="inline-block text-xs uppercase tracking-widest text-clay mb-4">
                                {product.vertical}
                            </span>

                            {/* Title */}
                            <h3 className="text-2xl mb-2 group-hover:text-clay transition-colors duration-300">
                                {product.name}
                            </h3>

                            {/* Tagline */}
                            <p className="text-ink-muted text-sm mb-4">{product.tagline}</p>

                            {/* Description */}
                            <p className="text-ink-light text-sm leading-relaxed mb-6">
                                {product.description}
                            </p>

                            {/* Link indicator */}
                            <div className="flex items-center gap-2 text-sm text-ink-muted group-hover:text-clay transition-colors duration-300">
                                <span>Visit site</span>
                                <ArrowUpRight
                                    weight="regular"
                                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                />
                            </div>

                            {/* Subtle corner accent on hover */}
                            <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-clay/30" />
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
}
