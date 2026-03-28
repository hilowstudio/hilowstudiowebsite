import { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotebookEntry } from "@/components/notebook/notebook-entry";
import { Footer } from "@/components/footer";

// Sample entries data - in production this would come from MDX files
const entries: Record<string, {
    title: string;
    date: string;
    category: string;
    content: string;
}> = {
    "the-quiet-exodus": {
        title: "The Quiet Exodus",
        date: "January 2026",
        category: "Philosophy",
        content: `There is a quiet exodus happening.

When I look around, I see 40-somethings and their families slowly decoupling from the systems that defined the 20th century. They are trading public schools for homeschooling. They are trading processed food for local CSAs. They are trading corporate funerals for green burials. They are trading "banking" for decentralized finance.

They aren't Luddites. They love the ease of modern technology. But they are exhausted by institutions.

They want agency. They want simplicity. They want their data back. And most of all, they want their attention back.

## The Hardware Problem

I realized that this movement—the "Post-Institutional" shift—has a hardware problem. We have the desire to live differently, but we are still using software built by the attention economy to do it.

That's the tension. We want to opt out of systems designed to capture our attention, but the tools we use to build alternatives are themselves built on the same extractive principles.

## The Alternative

What if we built software differently?

What if utility came first—solve the problem, then get out of the way? What if we designed tools that were addiction-free—no infinite scrolls, no doom-loops, no dark patterns? What if users owned their data, could export it, could leave whenever they wanted?

This is the thesis behind Hi-Low Studio.

We're building digital supports for analog living. Tools that help you do the thing you came to do, then return to your life offline.

The parallel economy needs better rails. We're building them.`,
    },
    "why-calm-tech": {
        title: "Why Calm Tech",
        date: "December 2025",
        category: "Design",
        content: `The attention economy has trained us to expect software that screams for our time. What if we built tools that whispered instead?

Every notification, every badge, every infinite scroll is designed to capture your attention and hold it hostage. These aren't bugs—they're features. They're the business model.

## The Cost

But there's a cost. We're raising children in households where the parents are perpetually distracted. We're building communities where people can't hold eye contact because they're waiting for their phone to buzz.

The promise of technology was that it would give us more time. The reality is that it has consumed more of our attention than any technology in human history.

## Another Way

Calm tech is the alternative. It's software designed with these principles:

1. **Get in, get out.** Solve the problem, then return the user to their life.
2. **No attention capture.** Zero dark patterns, no engagement tricks.
3. **Respect the user.** Their time is more valuable than your metrics.

This is harder than it sounds. It requires saying no to features that would boost engagement. It requires ignoring "best practices" that are actually worst practices in disguise.

But it's the right thing to do.`,
    },
};

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const entry = entries[slug];

    if (!entry) {
        return { title: "Entry Not Found | Hi-Low Studio" };
    }

    return {
        title: `${entry.title} | Notebook | Hi-Low Studio`,
        description: entry.content.slice(0, 160).replace(/\n/g, " "),
    };
}

export default async function NotebookEntryPage({ params }: PageProps) {
    const { slug } = await params;
    const entry = entries[slug];

    if (!entry) {
        notFound();
    }

    return (
        <>
            <main>
                <NotebookEntry
                    title={entry.title}
                    date={entry.date}
                    category={entry.category}
                    content={entry.content}
                />
            </main>
            <Footer />
        </>
    );
}
