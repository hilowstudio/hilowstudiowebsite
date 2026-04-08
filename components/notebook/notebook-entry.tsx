"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

interface NotebookEntryProps {
    title: string;
    date: string;
    category: string;
    content: string;
}

export function NotebookEntry({ title, date, category, content }: NotebookEntryProps) {
    // Simple markdown-like paragraph splitting
    const paragraphs = content.split("\n\n");

    return (
        <article className="py-24 md:py-32">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl mx-auto"
                >
                    {/* Back link */}
                    <Link
                        href="/notebook"
                        className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors mb-8"
                    >
                        <ArrowLeft weight="regular" className="w-4 h-4" />
                        Back to Notebook
                    </Link>

                    {/* Header */}
                    <header className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-sm italic text-ink-light">{date}</span>
                            <span className="w-1 h-1 rounded-full bg-ink/10" />
                            <span className="text-sm text-clay">{category}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl">{title}</h1>
                    </header>

                    {/* Content */}
                    <div className="prose-custom space-y-6">
                        {paragraphs.map((paragraph, index) => {
                            // Check if it's a heading
                            if (paragraph.startsWith("## ")) {
                                return (
                                    <h2 key={index} className="text-2xl mt-12 mb-4">
                                        {paragraph.replace("## ", "")}
                                    </h2>
                                );
                            }

                            // Check if it's a numbered list
                            if (paragraph.match(/^\d\./m)) {
                                const items = paragraph.split("\n").filter(Boolean);
                                return (
                                    <ol key={index} className="list-decimal pl-6 space-y-2">
                                        {items.map((item, i) => (
                                            <li key={i} className="text-ink-muted leading-relaxed">
                                                {item.replace(/^\d\.\s*\*\*/, "").replace(/\*\*\s*/, " ")}
                                            </li>
                                        ))}
                                    </ol>
                                );
                            }

                            // Regular paragraph
                            return (
                                <p key={index} className="text-ink-muted leading-relaxed">
                                    {paragraph}
                                </p>
                            );
                        })}
                    </div>

                    {/* Footer decoration */}
                    <div className="mt-16 pt-8 border-t border-ink/5">
                        <p className="text-xs text-ink-light italic text-center">
                            From the Hi Low Studio notebook
                        </p>
                    </div>
                </motion.div>
            </div>
        </article>
    );
}
