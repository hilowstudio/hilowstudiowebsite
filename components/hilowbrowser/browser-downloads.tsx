"use client";

import { motion } from "framer-motion";
import { DownloadSimple } from "@phosphor-icons/react";

const downloads = [
    {
        platform: "Windows",
        architecture: "x64",
        href: "https://github.com/taiyowhales/hilowbrowser/releases/download/v0.1.0/Hilow-Browser-Setup-0.1.0.exe",
        available: true,
    },
    {
        platform: "macOS",
        architecture: "Apple Silicon",
        href: "https://github.com/taiyowhales/hilowbrowser/releases/download/v0.1.0/Hilow-Browser-0.1.0-arm64.dmg",
        available: true,
    },
    {
        platform: "macOS",
        architecture: "Intel",
        href: "https://github.com/taiyowhales/hilowbrowser/releases/download/v0.1.0/Hilow-Browser-0.1.0.dmg",
        available: true,
    },
    {
        platform: "Linux",
        architecture: "x64",
        href: "https://github.com/taiyowhales/hilowbrowser/releases/download/v0.1.0/Hilow-Browser-0.1.0.AppImage",
        available: true,
    },
];

export function BrowserDownloads() {
    return (
        <section className="py-24 bg-paper-warm">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-12"
                >
                    <h2 className="text-3xl md:text-4xl mb-4">Download v0.1.0</h2>
                    <p className="text-ink-muted max-w-xl">
                        Early access. Pick your platform and get started.
                    </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl">
                    {downloads.map((download, index) => (
                        <motion.div
                            key={`${download.platform}-${download.architecture}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.5,
                                delay: 0.1 * index,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="p-6 rounded-lg border border-ink/5 bg-paper"
                        >
                            <DownloadSimple
                                weight="light"
                                className="w-6 h-6 text-ink-light mb-4"
                            />
                            <p className="text-sm font-medium text-ink mb-1">
                                {download.platform}
                            </p>
                            <p className="text-xs text-ink-light mb-4">
                                {download.architecture}
                            </p>
                            {download.available ? (
                                <a
                                    href={download.href}
                                    className="inline-flex items-center gap-2 text-xs font-medium text-clay hover:text-clay-muted transition-colors duration-300"
                                >
                                    Download
                                </a>
                            ) : (
                                <span className="text-xs text-ink-light italic">
                                    Coming soon
                                </span>
                            )}
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-8 max-w-xl p-6 rounded-lg border border-ink/5 bg-paper"
                >
                    <p className="text-xs uppercase tracking-widest text-ink-light mb-3">
                        A note on installation
                    </p>
                    <p className="text-sm text-ink-muted leading-relaxed">
                        Hilow Browser does not yet have a signing certificate. Your
                        operating system will warn you that the app is from an
                        "unidentified developer." On <strong className="text-ink">macOS</strong>,
                        right-click the app and select "Open" to bypass Gatekeeper. On{" "}
                        <strong className="text-ink">Windows</strong>, click "More info"
                        then "Run anyway" on the SmartScreen prompt. We are working on
                        obtaining a code signing certificate for future releases.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
