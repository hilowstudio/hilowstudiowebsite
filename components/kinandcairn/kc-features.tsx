"use client";

import { motion } from "framer-motion";

const sections = [
    {
        paragraphs: [
            "The death positive movement has created a new class of practitioner \u2014 death doulas, home funeral guides, end-of-life planners, celebrants, grief coaches \u2014 professionals who help families reclaim the most intimate passage of human life from institutional assembly lines. These practitioners are doing sacred work with consumer software that was never designed for it. Spreadsheets for vigil schedules. Text threads for medical updates at 3 a.m. Filing cabinets for advance directives.",
            "Kin & Cairn gives this emerging industry its own infrastructure. Practice management for practitioners. A coordination hub for families and circles of care. A verified directory so the right guide can be found at the right time.",
        ],
    },
    {
        title: "Built for the bedside.",
        paragraphs: [
            "We built it the way we build everything: for the moment you close it.",
            "The interface defaults to dark mode because it will be used at a bedside in low light. Touch targets are oversized because hands may be trembling. Every field auto-saves because a user may lose focus mid-sentence and never come back to finish. Error messages are calm and brief. There are no onboarding tutorials, no tooltips that follow you around, no confetti. There is nothing to celebrate here. There is only something to support.",
        ],
    },
    {
        title: "Humans do what only humans can do.",
        paragraphs: [
            "Families coordinate vigil shifts, log medications, and hand off care, then put the phone down and hold a hand. Practitioners manage contracts, track certifications, and process payments, then close the laptop and show up for the work that matters. The software handles computation, scheduling, and recall so that humans can do what only humans can do: sit with someone. Be present. Say goodbye.",
        ],
    },
    {
        title: "Data that carries weight.",
        paragraphs: [
            "Sensitive data is encrypted at rest and never leaves the people it belongs to. Bedside photos, advance directives, account credentials, and medical notes live in a vault built for the weight they carry. Nothing is sold. Nothing is shared with ad networks. Nothing is harvested. When the work is done and the account is closed, the data goes with the family or disappears entirely, at their request.",
            "Notifications respect quiet hours. Anniversary reminders are opt-in only. The software understands that grief does not operate on a product engagement schedule.",
        ],
    },
    {
        title: "Why death care.",
        paragraphs: [
            "Kin & Cairn serves the death care industry because it is one of the places where the distance between technology and real life is the most obscene and the most fixable. Dying is not a workflow. Grief is not a user journey. But the people navigating them deserve tools that are worthy of the task.",
            "Digital infrastructure for the hardest days. Nothing more.",
        ],
    },
];

export function KCFeatures() {
    return (
        <section className="py-24 bg-paper-warm">
            <div className="container-calm">
                <div className="max-w-2xl space-y-16">
                    {sections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                                duration: 0.6,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            {section.title && (
                                <h2 className="text-2xl mb-6">{section.title}</h2>
                            )}
                            <div className="space-y-4 text-ink-muted leading-relaxed">
                                {section.paragraphs.map((paragraph, i) => (
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
