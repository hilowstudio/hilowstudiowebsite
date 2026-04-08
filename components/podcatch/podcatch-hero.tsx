"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function PodcatchHero() {
    return (
        <section className="py-24 md:py-32">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl"
                >
                    <p className="text-sm text-ink-muted mb-6">Media</p>
                    <h1 className="text-4xl md:text-5xl mb-8">
                        Podcatch
                    </h1>
                    <Image
                        src="/podcatch.png"
                        alt="Podcatch"
                        width={200}
                        height={200}
                        className="block mb-8"
                    />
                    <div className="space-y-6 text-ink-muted leading-relaxed">
                        <p className="text-ink font-medium">
                            The problem isn't that you listen to podcasts. It's that you
                            can't use what you heard without going back to the screen.
                        </p>
                        <p>
                            You listen on a walk. In the car. While cooking dinner. A guest
                            mentions a book that would change how you think about curriculum.
                            A physician names a protocol you've been looking for. A founder
                            describes the exact mistake you're about to make.
                        </p>
                        <p>
                            By the time you're back at a screen, it's gone.
                        </p>
                        <p>
                            The conventional solution is more screen time. Scrub through a
                            two-hour episode. Open another app. Start another tab. The tools
                            that were supposed to help you capture knowledge pull you right
                            back into the attention economy you were trying to escape.
                        </p>
                        <p className="text-ink font-medium">
                            Podcatch does the opposite. It transcribes, summarizes, and
                            organizes your podcast library so that the knowledge comes to
                            you, on your terms, in your time, in the tools you already use.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
