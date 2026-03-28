"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function BrowserHero() {
    return (
        <section className="py-24 md:py-32">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl"
                >
                    <p className="text-sm text-ink-muted mb-6">Daily Computing</p>
                    <h1 className="text-4xl md:text-5xl mb-8">
                        Hilow Browser
                    </h1>
                    <Image
                        src="/hilowbrowser.png"
                        alt="Hilow Browser"
                        width={200}
                        height={200}
                        className="block mb-8"
                    />
                    <div className="space-y-6 text-ink-muted leading-relaxed">
                        <p>
                            Hilow Browser is a desktop browser that treats your attention
                            as something worth protecting.
                        </p>
                        <p>
                            It was designed as a cognitive support tool, primarily for
                            people with ADHD, but for anyone who has ever opened a tab to
                            check one thing and surfaced two hours later, unsure where the
                            time went.
                        </p>
                        <p className="text-ink font-medium">
                            It asks you a question before you begin: What are you here to do?
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
