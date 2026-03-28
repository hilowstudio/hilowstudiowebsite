"use client";

import { motion } from "framer-motion";

const services = [
    {
        title: "Build",
        subtitle: "Automations",
        description:
            "We build the systems that handle the work you shouldn't be doing manually. Intake processing, CRM workflows, reporting pipelines, document generation, client onboarding sequences, and more. The repetitive operational tasks that consume your day but don't require your judgment. No-code or custom-code, depending on what the problem demands. You own everything we build.",
    },
    {
        title: "Teach",
        subtitle: "Knowledge Systems & AI",
        description:
            "One-on-one and small-group training that teaches you to build a personal knowledge system and then put it to work with AI. You'll learn to capture what matters, organize it so you can find it, and structure it so AI tools stop sounding generic and start working like an assistant that actually knows your business. You leave with a working system, not a theory.",
    },
    {
        title: "Design",
        subtitle: "Calm Technology",
        description:
            "Technology should inform without demanding attention. We apply calm technology principles to product interfaces and business workflows, designing systems that stay in the background until the moment they're needed, degrade gracefully, and respect the limited attention of the people who use them.",
    },
];

const topics = [
    {
        title: "Capture & Organize",
        description:
            "You learn a method for deciding what to save and where to put it. Not a filing system, but a thinking system that is organized around your active projects and long-term responsibilities, so every note has a purpose and a place. Tool-agnostic: Notion, Obsidian, Apple Notes, whatever you already use.",
    },
    {
        title: "Retrieve & Reuse",
        description:
            "You store knowledge so you can retrieve it when you need it. You learn to refine your notes progressively so the most important ideas surface immediately. No more starting from scratch on every proposal, email, or project. Your past thinking becomes raw material for your current work.",
    },
    {
        title: "AI That Knows You",
        description:
            "Once your knowledge is organized, AI gets dramatically more useful. You learn to give AI the right context so it stops producing generic output and starts producing work that sounds like you. This is the difference between AI as a toy and AI as a genuine collaborator.",
    },
];

export function ConsultingServices() {
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
                        What We Offer
                    </p>
                    <h2 className="text-3xl md:text-4xl mb-4">
                        Three Ways to Work Together
                    </h2>
                    <p className="text-ink-muted max-w-xl">
                        Whether you need a system built, want to learn to build your
                        own, or need help designing technology that respects your
                        users, we have a path for you.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.6,
                                delay: 0.1 * index,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="p-8 rounded-lg border border-ink/5 bg-paper"
                        >
                            <span className="text-xs uppercase tracking-widest text-clay mb-4 block">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <h3 className="text-lg mb-1">{service.title}</h3>
                            <p className="text-sm text-ink-muted mb-3">
                                {service.subtitle}
                            </p>
                            <p className="text-sm text-ink-muted leading-relaxed">
                                {service.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Deep-dive: What We Teach */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-24 grid md:grid-cols-5 gap-12 max-w-5xl"
                >
                    <div className="md:col-span-2">
                        <p className="text-xs uppercase tracking-widest text-ink-light mb-6">
                            What We Teach
                        </p>
                        <h2 className="text-3xl md:text-4xl mb-6">
                            A System That Thinks With You
                        </h2>
                        <p className="text-ink-muted leading-relaxed">
                            Most people collect information they never use. They
                            bookmark articles, save notes, and screenshot things, and
                            none of it is findable when they need it. We teach you
                            to build a personal knowledge system that changes this,
                            and then extend it with AI so the system puts your knowledge
                            to work for you.
                        </p>
                    </div>

                    <div className="md:col-span-3 space-y-10">
                        {topics.map((topic, index) => (
                            <motion.div
                                key={topic.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.1 * index,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            >
                                <span className="text-xs uppercase tracking-widest text-clay mb-3 block">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <h3 className="text-lg mb-2">{topic.title}</h3>
                                <p className="text-sm text-ink-muted leading-relaxed">
                                    {topic.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
