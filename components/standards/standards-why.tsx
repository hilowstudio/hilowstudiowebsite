"use client";

import { motion } from "framer-motion";

const landscape = [
    {
        label: "WCAG",
        status: "Auditable standard",
        scope: "Accessibility",
        note: "The gold standard for auditable design criteria. Proves this model works. But it covers disability access only \u2014 not attention, data sovereignty, dark patterns, or engagement ethics.",
    },
    {
        label: "Calm Tech Institute",
        status: "81-point certification",
        scope: "Hardware",
        note: "Evaluates physical products across materials, light, and sound. Certified reMarkable, Mudita, Daylight Computer. No coverage for software UX, data portability, or engagement loops.",
    },
    {
        label: "GDPR Certification Marks",
        status: "Auditable certification",
        scope: "Data consent",
        note: "EuroPriSe and similar schemes certify data protection compliance. Covers consent-related dark patterns but not engagement design, notification ethics, or graceful offboarding.",
    },
    {
        label: "Center for Humane Technology",
        status: "Advocacy",
        scope: "Awareness",
        note: "Built massive public awareness around attention exploitation. Publishes frameworks and toolkits. Does not certify products or offer an auditable standard.",
    },
    {
        label: "IEEE 7000",
        status: "Process standard",
        scope: "Design process",
        note: "Tells organizations how to incorporate ethics into design. Audits the process, not the product. Cannot tell you whether an app\u2019s notifications respect your dinner.",
    },
    {
        label: "Norwegian Consumer Council",
        status: "Policy report",
        scope: "Regulation",
        note: "\u201CBreaking Free\u201D identifies enshittification and pushes for the EU Digital Fairness Act. Operates at the policy level \u2014 no engineering criteria a developer can test against.",
    },
];

export function StandardsWhy() {
    return (
        <section className="py-24 bg-paper-warm">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-16"
                >
                    <p className="text-xs uppercase tracking-widest text-ink-light mb-6">
                        The Landscape
                    </p>
                    <h2 className="text-3xl md:text-4xl mb-4">
                        Good Work Exists. The Gap Is Specific.
                    </h2>
                    <p className="text-ink-muted max-w-2xl">
                        Organizations are doing important work on ethical
                        technology in advocacy, hardware certification,
                        privacy law, accessibility, and process standards.
                        What doesn&apos;t exist is a product-level,
                        auditable standard for how software treats your
                        attention, your data, and your right to leave.
                        QSF fills that specific gap.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
                    {landscape.map((item, index) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.6,
                                delay: 0.05 * index,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="p-8 rounded-lg border border-ink/5 bg-paper"
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <h3 className="text-lg">{item.label}</h3>
                            </div>
                            <div className="flex gap-2 mb-4">
                                <span className="text-xs px-2.5 py-1 rounded-full border border-ink/10 text-ink-muted">
                                    {item.status}
                                </span>
                                <span className="text-xs px-2.5 py-1 rounded-full border border-ink/10 text-ink-muted">
                                    {item.scope}
                                </span>
                            </div>
                            <p className="text-sm text-ink-muted leading-relaxed">
                                {item.note}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-16 max-w-2xl"
                >
                    <p className="text-ink leading-relaxed">
                        QSF is designed to complement this work, not replace
                        it. A product could hold WCAG conformance for
                        accessibility, GDPR certification for data protection,
                        Calm Tech certification for its hardware, and
                        QSF certification for how its software respects the
                        people who use it. These are different questions.
                        We answer the one no one else is asking.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
