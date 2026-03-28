"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function QCHero() {
    return (
        <section className="py-24 md:py-32">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl"
                >
                    <p className="text-sm text-ink-muted mb-6">Education</p>
                    <h1 className="text-4xl md:text-5xl mb-8">
                        Quill & Compass
                    </h1>
                    <Image
                        src="/quillandcompass.png"
                        alt="Quill & Compass"
                        width={200}
                        height={200}
                        className="block mb-8"
                    />
                    <div className="space-y-6 text-ink-muted leading-relaxed">
                        <p className="text-ink font-medium">
                            A thoughtful toolkit for the modern Christian homeschooling family.
                        </p>
                        <p>
                            Homeschooling is one of the most radical acts of presence a
                            parent can choose. You are saying: I will be here. I will do
                            this myself. My children are worth my full attention.
                        </p>
                        <p>
                            But the tools available to you were not built for that life.
                            They were built for institutions. They assume a classroom of
                            thirty, not a kitchen table of three. They assume a
                            credentialed specialist, not a parent learning alongside their
                            kids. And the apps that claim to help you plan, the ones on
                            your phone and in your browser, are designed to keep you
                            scrolling, not to get you back to your children.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
