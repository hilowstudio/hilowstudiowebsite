import { Metadata } from "next";
import { PhilosophyHero } from "@/components/philosophy/philosophy-hero";
import { QuietExodus } from "@/components/quiet-exodus";
import { TheProblem } from "@/components/the-problem";
import { ParallelEconomy } from "@/components/parallel-economy";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Philosophy | Hi Low Studio",
    description:
        "Why Hi Low Studio builds calm technology. The quiet exodus from institutional systems, the attention economy problem, and the parallel economy we are laying rails for.",
};

export default function PhilosophyPage() {
    return (
        <>
            <main>
                <PhilosophyHero />
                <QuietExodus />
                <TheProblem />
                <ParallelEconomy />
            </main>
            <Footer />
        </>
    );
}
