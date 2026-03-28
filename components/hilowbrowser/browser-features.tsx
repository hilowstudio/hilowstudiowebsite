"use client";

import { motion } from "framer-motion";

const features = [
    {
        title: "Intent Before Input",
        paragraphs: [
            "Every browsing session in Hilow starts with a declaration of purpose and a brief check-in on your physical and mental capacity. The browser does not collect this data. It uses it in the moment to calibrate how much support you need right now.",
            "When your capacity is high, Hilow stays quiet. When your energy fades or your impulse control drops, it gently increases friction within boundaries you already agreed to.",
        ],
    },
    {
        title: "Focus Guardrails",
        paragraphs: [
            "When you drift off-task, Hilow does not slam a door. It holds up a mirror.",
            "A simple prompt appears: Is this relevant to what you came here to do? You decide. If you say no, the browser grants you five minutes of time-boxed access. Enough to scratch the itch without falling into the hole. When the time is up, it brings you back.",
            "This mechanism is built on a clinical insight: most people with ADHD do not lack the ability to focus. They lack the ability to notice when focus has shifted. Hilow makes the shift visible so you can choose what to do about it.",
        ],
    },
    {
        title: "Impulse Protection",
        paragraphs: [
            "When you land on a shopping page, Hilow grabs your attention. You can save the item for later or proceed, but proceeding requires you to type a justification to yourself. Most purchase impulses fade within minutes. Hilow gives them room to.",
        ],
    },
    {
        title: "Capacity Tracking",
        paragraphs: [
            "Hilow maintains a real-time model of your cognitive capacity \u2014 a bio-battery that accounts for sleep quality, hydration, medication timing, focus fatigue, and even menstrual cycle phase for those who opt in. As your capacity changes throughout the day, the browser's support level adjusts with it.",
            "This is calm technology in practice: software that responds to your actual state, not a product manager's engagement target.",
        ],
    },
    {
        title: "Basic AI Assistance",
        paragraphs: [
            "An optional AI sidekick lives in a collapsible side panel. It can summarize a long article, help you draft an email, or translate a page. It does not initiate conversation. It does not suggest things to read. It does not have a personality. It waits for you to ask, answers, and recedes.",
            "You bring your own API key. We never see your data.",
        ],
    },
    {
        title: "Calm Design",
        paragraphs: [
            "The interface uses earth tones, a serif typeface, and language borrowed from cockpit instruments: neutral, precise, factual. There are no exclamation points anywhere in the application.",
            "We designed Hilow Browser to treat your attention as a limited resource to be protected, not extracted for consumer data and ad revenue.",
        ],
    },
];

export function BrowserFeatures() {
    return (
        <section className="py-24">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-16"
                >
                    <h2 className="text-3xl md:text-4xl mb-4">
                        How It Works
                    </h2>
                </motion.div>

                <div className="max-w-2xl space-y-16">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                                duration: 0.6,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <p className="text-xs uppercase tracking-widest text-clay mb-4">
                                {String(index + 1).padStart(2, "0")}
                            </p>
                            <h3 className="text-2xl mb-6">{feature.title}</h3>
                            <div className="space-y-4 text-ink-muted leading-relaxed">
                                {feature.paragraphs.map((paragraph, i) => (
                                    <p key={i}>{paragraph}</p>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
