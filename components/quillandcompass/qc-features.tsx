"use client";

import { motion } from "framer-motion";

const features = [
    {
        title: "The blank page is the enemy of your morning",
        paragraphs: [
            "The hardest part of homeschooling is not the teaching. It is the planning. The hours spent staring at a blank document, trying to turn a stack of books and a set of learning objectives into something that will actually work on Tuesday.",
            "Quill & Compass eliminates the blank page. You tell it what you are teaching, and it scaffolds for you. Lesson plans, worksheets, reading comprehension exercises, quizzes, and writing prompts \u2014 all structured around your family's educational philosophy, your student's learning style, and the books already on your shelf.",
            "Quill & Compass helps you with administration so you can give your best energy to the conversation.",
        ],
    },
    {
        title: "Differentiated Learning",
        paragraphs: [
            "Every student in your household gets a learning profile \u2014 how they process information, what motivates them, how they prefer to be encouraged. The platform uses that profile to adapt every piece of generated content to the way your child actually learns.",
            "This is not behavioral targeting. There is no ad network on the other end. Your family's data belongs to you. The personality profile exists for one reason: so that a worksheet about fractions lands differently for a child who needs step-by-step scaffolding than it does for one who wants to race ahead.",
        ],
    },
    {
        title: "A curriculum compiler, not a content treadmill",
        paragraphs: [
            "Most ed-tech platforms want you to come back every day. We built a compiler. You define specifications like subject, duration, reading level, constraints, and the system generates a complete, coordinated curriculum bundle: teacher guide, student packet, reading anthology, graphic organizers, and slides. It runs a verification pass. It hands you the result. You print it and go teach, or complete it within the app if that is best for you.",
            "There are no streaks. No badges. No gamification loops engineered to keep you engaged with the platform instead of engaged with your children.",
        ],
    },
    {
        title: "Your library. Your standards. Your faith.",
        paragraphs: [
            "Scan the books you already own. The platform indexes them, understands their content, and generates materials directly from your family's library \u2014 not from a corporate content catalog you didn't choose.",
            "Align your courses to an academic spine of standards and objectives, or don't. Integrate your family's faith tradition into the curriculum, or keep it secular. The tool adapts to your convictions. It does not impose ours.",
        ],
    },
    {
        title: "Plan the week. Then close the app.",
        paragraphs: [
            "The weekly planner helps you distribute lessons across your school days, account for holidays and field trips, and coordinate schedules across multiple students. It is a calendar. It does what a calendar should do. It does not send you push notifications during dinner. It does not suggest \"related content\" when you open it to check tomorrow's schedule.",
            "When the week is planned, you are done. Go be with your family.",
        ],
    },
    {
        title: "When your child needs help and you are not sure how to give it",
        paragraphs: [
            "Our Inkling subject aide meets your students where they are, in their subject, at their level, in their voice. It walks them through problems step by step. It does not replace you. It handles the moments when you are making lunch and your twelve-year-old is stuck on algebraic expressions.",
            "Every conversation is monitored for safety \u2014 not by harvesting data, but by scanning for patterns that indicate a child may be struggling with something bigger than homework. If something concerning surfaces, you are notified. Quietly. Privately. Because the platform understands that it is a tool in your household, not an authority over it.",
        ],
    },
    {
        title: "Built for the family that chose to be present",
        paragraphs: [
            "Quill & Compass is not trying to become the center of your homeschool. It is trying to make the planning faster, the materials better, and the logistics simpler \u2014 so that the center of your homeschool can be you, your children, and the life you are building together.",
            "The right amount of technology is the minimum needed. This is that.",
        ],
    },
];

export function QCFeatures() {
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
