import { Metadata } from "next";
import { StandardsHero } from "@/components/standards/standards-hero";
import { StandardsWhy } from "@/components/standards/standards-why";
import { StandardsDomains } from "@/components/standards/standards-domains";
import { StandardsScoring } from "@/components/standards/standards-scoring";
import { StandardsCTA } from "@/components/standards/standards-cta";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Quiet Standards Framework | Hi-Low Studio",
    description:
        "The first open, auditable certification standard for attention-respecting software. 104 criteria across 7 domains. Built by Hi-Low Studio.",
};

export default function StandardsPage() {
    return (
        <>
            <main>
                <StandardsHero />
                <StandardsWhy />
                <StandardsDomains />
                <StandardsScoring />
                <StandardsCTA />
            </main>
            <Footer />
        </>
    );
}
