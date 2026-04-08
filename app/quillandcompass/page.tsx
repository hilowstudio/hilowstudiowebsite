import { Metadata } from "next";
import { QCHero } from "@/components/quillandcompass/qc-hero";
import { QCFeatures } from "@/components/quillandcompass/qc-features";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Quill & Compass | Hi Low Studio",
    description:
        "A thoughtful toolkit for the modern Christian homeschooling family. Lesson planning, differentiated learning, and curriculum generation, all built to get you back to your children.",
};

export default function QuillAndCompassPage() {
    return (
        <>
            <main>
                <QCHero />
                <QCFeatures />
            </main>
            <Footer />
        </>
    );
}
