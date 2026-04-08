import { Metadata } from "next";
import { AboutHero } from "@/components/about/about-hero";
import { AboutThroughline } from "@/components/about/about-throughline";
import { AboutCreature } from "@/components/about/about-creature";
import { AboutHonesty } from "@/components/about/about-honesty";
import { AboutClose } from "@/components/about/about-close";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "About | Hi-Low Studio",
    description:
        "A personal note from Adam Vega, founder of Hi-Low Studio. The person behind the calm tech practice, the throughline from healthcare operations and church planting to building software for the parallel economy, and how every part of the studio fits together.",
};

export default function AboutPage() {
    return (
        <>
            <main>
                <AboutHero />
                <AboutThroughline />
                <AboutCreature />
                <AboutHonesty />
                <AboutClose />
            </main>
            <Footer />
        </>
    );
}
