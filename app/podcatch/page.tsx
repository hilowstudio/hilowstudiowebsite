import { Metadata } from "next";
import { PodcatchHero } from "@/components/podcatch/podcatch-hero";
import { PodcatchFeatures } from "@/components/podcatch/podcatch-features";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Podcatch | Hi Low Studio",
    description:
        "Podcatch transcribes, summarizes, and organizes your podcast library so the knowledge comes to you, on your terms, without pulling you back to the screen.",
};

export default function PodcatchPage() {
    return (
        <>
            <main>
                <PodcatchHero />
                <PodcatchFeatures />
            </main>
            <Footer />
        </>
    );
}
