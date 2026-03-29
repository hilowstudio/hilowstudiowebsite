"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PaperPlaneTilt, Check } from "@phosphor-icons/react";

export function Footer() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // Simulate submission - replace with actual newsletter API
        setStatus("loading");
        setTimeout(() => {
            setStatus("success");
            setEmail("");
        }, 1000);
    };

    return (
        <footer className="py-16 border-t border-ink/10">
            <div className="container-calm">
                <div className="max-w-4xl mx-auto">
                    {/* Newsletter Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center mb-12"
                    >
                        <h3 className="text-xl mb-3">Stay in the loop</h3>
                        <p className="text-ink-muted text-sm mb-6 max-w-md mx-auto">
                            Occasional dispatches on building for the parallel economy.
                            No spam. Unsubscribe anytime.
                        </p>

                        {/* Newsletter Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                disabled={status === "loading" || status === "success"}
                                className="flex-1 px-4 py-3 rounded-md border border-ink/10 bg-paper text-ink placeholder:text-ink-light text-sm focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 disabled:opacity-50 transition-all duration-300"
                            />
                            <button
                                type="submit"
                                disabled={status === "loading" || status === "success"}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-clay text-paper text-sm font-medium hover:bg-clay-muted focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 disabled:opacity-50 transition-all duration-300 min-w-[120px]"
                            >
                                {status === "success" ? (
                                    <>
                                        <Check weight="bold" className="w-4 h-4" />
                                        <span>Subscribed</span>
                                    </>
                                ) : status === "loading" ? (
                                    <span>Sending...</span>
                                ) : (
                                    <>
                                        <span>Subscribe</span>
                                        <PaperPlaneTilt weight="regular" className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* Divider */}
                    <div className="w-full h-px bg-ink/5 mb-6" />

                    {/* Transparency */}
                    <p className="text-xs text-ink-light text-center mb-6">
                        Hi-Low Studio is bootstrapped and funded by consulting
                        services and product sales. We do not sell data or run
                        ads.
                    </p>

                    {/* Bottom Row */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-muted">
                        {/* Logo / Name */}
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-ink">Hi-Low Studio</span>
                            <span className="text-ink-light">·</span>
                            <span>Digital Supports for Analog Living</span>
                        </div>

                        {/* Links */}
                        <div className="flex items-center gap-6">
                            <a
                                href="mailto:hello@hilowstudio.dev"
                                className="hover:text-clay transition-colors duration-300"
                            >
                                Contact
                            </a>
                            <Link
                                href="/privacy"
                                className="hover:text-clay transition-colors duration-300"
                            >
                                Privacy
                            </Link>
                            <Link
                                href="/changelog"
                                className="hover:text-clay transition-colors duration-300"
                            >
                                Changelog
                            </Link>
                            <span className="text-ink-light">
                                © {new Date().getFullYear()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
