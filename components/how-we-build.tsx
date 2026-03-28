"use client";

import { motion } from "framer-motion";

const commitments = [
    {
        title: "Design for the smallest possible amount of your attention",
        description:
            "Our interfaces inform and then recede. They live in the periphery of your awareness until the moment you need them, and they return there when you are done. We are intentionally boring. We consider that a feature.",
    },
    {
        title: "Solve the problem, then get out of your way",
        description:
            "No gamification. No streaks. No badges. No doom-loops. No infinite scrolls. We will never engineer a reason for you to stay longer than you need to. Our success is measured by how quickly you can close the app and get back to your life.",
    },
    {
        title: "Amplify the best of people and technology, without confusing the two",
        description:
            "Machines should not act like humans. Humans should not act like machines. We let technology handle what it does well — computation, organization, recall — so that you can do what you do well: make decisions, raise your family, be present.",
    },
    {
        title: "Your data belongs to you",
        description:
            "Not to us. Not to our investors. Not to an ad network. We build for true data portability. You own your records and can always take your digital life with you. This is not a marketing checkbox. It is a structural commitment.",
    },
    {
        title: "Our software degrades gracefully",
        description:
            "When something breaks — and eventually, something always breaks — our tools continue to function. They fall back, they simplify, they keep working. They never fail catastrophically and take your data with them.",
    },
    {
        title: "We respect your time and your social norms",
        description:
            "We do not send push notifications at dinner. We do not vibrate in your pocket during a funeral. We do not demand your attention in the middle of a conversation with your child. Our software understands that it is a guest in your life, not the host.",
    },
];

export function HowWeBuild() {
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
                    <p className="text-xs uppercase tracking-widest text-ink-light mb-6">
                        Our Commitments
                    </p>
                    <h2 className="text-3xl md:text-4xl mb-4">How We Build</h2>
                    <p className="text-ink-muted max-w-xl">
                        Every piece of software that leaves our studio is governed by a
                        simple set of commitments.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
                    {commitments.map((commitment, index) => (
                        <motion.div
                            key={commitment.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.6,
                                delay: 0.1 * index,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="p-8 rounded-lg border border-ink/5 bg-paper-warm"
                        >
                            <span className="text-xs uppercase tracking-widest text-clay mb-4 block">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <h3 className="text-lg mb-3">{commitment.title}</h3>
                            <p className="text-sm text-ink-muted leading-relaxed">
                                {commitment.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
