import { Metadata } from "next";
import { KCHero } from "@/components/kinandcairn/kc-hero";
import { KCFeatures } from "@/components/kinandcairn/kc-features";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Kin & Cairn | Hi-Low Studio",
    description:
        "The operating system for the post-institutional death care industry. Practice management, family coordination, and a practitioner directory — built for the bedside.",
};

export default function KinAndCairnPage() {
    return (
        <>
            <main>
                <KCHero />
                <KCFeatures />
            </main>
            <Footer />
        </>
    );
}
