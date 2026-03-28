"use client";

import { motion } from "framer-motion";

const features = [
    {
        title: "Machines do the transcription. AI extracts the structure. You make the decisions.",
        paragraphs: [
            "When a new episode drops, Podcatch processes it in the background. Full transcript. Key takeaways. Chapters. Books and people mentioned. It handles the computation, organization, and recall \u2014 the things machines are good at \u2014 so you don't have to hold it all in your head while you're trying to be present.",
            "When you're ready, the knowledge is there. Search across your entire library. Ask a question and get an answer grounded in what was actually said. Or let it flow directly into Notion, Readwise, Obsidian, Google Drive \u2014 wherever your notes already live.",
            "Then close the app. That's the whole point.",
        ],
    },
    {
        title: "Your library belongs to you.",
        paragraphs: [
            "Every transcript, every summary, every insight Podcatch generates is yours. Export it. Sync it. Take it somewhere else. We built for true data portability \u2014 not because it's a competitive feature, but because it's the only honest way to build. You should never be trapped in our product to access knowledge you already earned by listening.",
        ],
    },
    {
        title: "We designed Podcatch to need as little of your attention as possible.",
        paragraphs: [
            "No infinite scroll. No algorithmic feed. No engagement metrics. No streaks. Podcatch checks your feeds, processes new episodes, and waits. It does not ping you at dinner. It does not badge your home screen to manufacture urgency. It sits in the periphery until you need it, and it returns there when you're done.",
            "The best podcasts help you think. Podcatch makes sure you don't lose the thread \u2014 without asking you to trade your attention to keep it.",
        ],
    },
];

export function PodcatchFeatures() {
    return (
        <section className="py-24 bg-paper-warm">
            <div className="container-calm">
                <div className="max-w-2xl space-y-16">
                    {features.map((feature, index) => (
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
                            <h2 className="text-2xl mb-6">{feature.title}</h2>
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
