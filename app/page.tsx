import { Hero } from "@/components/hero";
import { QuietExodus } from "@/components/quiet-exodus";
import { TheProblem } from "@/components/the-problem";
import { ParallelEconomy } from "@/components/parallel-economy";
import { HowWeBuild } from "@/components/how-we-build";
import { TheFuture } from "@/components/the-future";
import { Footer } from "@/components/footer";

export default function Home() {
    return (
        <>
            <main>
                <Hero />
                <QuietExodus />
                <TheProblem />
                <ParallelEconomy />
                <HowWeBuild />
                <TheFuture />
            </main>
            <Footer />
        </>
    );
}
