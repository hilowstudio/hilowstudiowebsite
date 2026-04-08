import { Metadata } from "next";
import { BespokeHero } from "@/components/services/bespoke/bespoke-hero";
import { BespokeOfferings } from "@/components/services/bespoke/bespoke-offerings";
import { BespokeProcess } from "@/components/services/bespoke/bespoke-process";
import { BespokeCTA } from "@/components/services/bespoke/bespoke-cta";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Bespoke Engagements | Hi-Low Studio",
    description:
        "AI automations, personal knowledge systems, and calm technology consulting. We help founders and small businesses build the systems that give them their time back.",
};

export default function BespokePage() {
    return (
        <>
            <main>
                <BespokeHero />
                <BespokeOfferings />
                <BespokeProcess />
                <BespokeCTA />
            </main>
            <Footer />
        </>
    );
}
