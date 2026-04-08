import { Hero } from "@/components/hero";
import { TheWork } from "@/components/the-work";
import { HowWeBuild } from "@/components/how-we-build";
import { TheFuture } from "@/components/the-future";
import { Footer } from "@/components/footer";

export default function Home() {
    return (
        <>
            <main>
                <Hero />
                <TheWork />
                <HowWeBuild />
                <TheFuture />
            </main>
            <Footer />
        </>
    );
}
