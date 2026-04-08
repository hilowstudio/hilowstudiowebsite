"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function AboutHero() {
    return (
        <section className="py-24 md:py-32">
            <div className="container-calm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl"
                >
                    <p className="text-sm text-ink-muted mb-8">
                        The person behind the studio
                    </p>
                    <Image
                        src="/adam-profile.png"
                        alt="Adam Vega, founder of Hi-Low Studio"
                        width={256}
                        height={256}
                        priority
                        className="block rounded-lg mb-10"
                    />
                    <h1 className="text-4xl md:text-5xl mb-8">
                        Hi, I&apos;m Adam.
                    </h1>
                    <div className="space-y-6 text-ink-muted leading-relaxed">
                        <p>
                            Hi-Low Studio is my studio. Right now, &ldquo;studio&rdquo;
                            and &ldquo;I&rdquo; are the same thing. That may change one
                            day. For now, when you&apos;re reading this page, you&apos;re
                            reading a single person&apos;s note about the work he is
                            doing, why he is doing it, and how every branch of it
                            connects to the others.
                        </p>
                        <p>
                            I&apos;m Adam Vega. I'm a married dad of three homeschooled
                            boys. I live in the greater Chicago area. I run Hi Low Studio.
                            Before this, I spent a decade in healthcare operations
                            tackling hospital telecommunications, information security,
                            and clinical team management. I also spent eight
                            years, concurrently, planting a church. That church was
                            the work I loved most and the work that broke me. It ended
                            in burnout and rendering myself unfit to continue in ministry.
                            In the aftermath, I have learned that compartmentalization and
                            masking of self are not sustainable.
                        </p>
                        <p className="text-ink font-medium">
                            One lesson I took out of that season is that I am no
                            longer willing to build work on top of a version of myself
                            that isn&apos;t real, and I don&apos;t think anyone else
                            should have to either.
                        </p>
                        <p>
                            Whole-self integration is central to my work, and
                            it&apos;s what I most want to model for other ADHD founders
                            wondering whether they can bring their whole brain to their
                            work. You can.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
