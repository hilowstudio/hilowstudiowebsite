"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function KCHero() {
    return (
        <section className="py-24 md:py-32">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl"
                >
                    <p className="text-sm text-ink-muted mb-6">End of Life</p>
                    <h1 className="text-4xl md:text-5xl mb-8">
                        Kin & Cairn
                    </h1>
                    <Image
                        src="/kinandcairn.png"
                        alt="Kin & Cairn"
                        width={200}
                        height={200}
                        className="block mb-8"
                    />
                    <div className="space-y-6 text-ink-muted leading-relaxed">
                        <p className="text-ink font-medium">
                            The operating system for the post-institutional death care
                            industry.
                        </p>
                        <p>
                            Someone you love is dying. You are sitting at their bedside at
                            2 a.m., trying to remember what the night shift volunteer said
                            about the last dose of morphine. Your phone screen sears your
                            eyes. Three apps want your attention. None of them were built
                            for this moment.
                        </p>
                        <p className="text-ink font-medium">
                            Kin & Cairn was.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
