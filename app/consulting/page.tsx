import { Metadata } from "next";
import { ConsultingHero } from "@/components/consulting/consulting-hero";
import { ConsultingServices } from "@/components/consulting/consulting-services";
import { ConsultingProcess } from "@/components/consulting/consulting-process";
import { ConsultingCTA } from "@/components/consulting/consulting-cta";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Services | Hi-Low Studio",
    description:
        "AI automations, personal knowledge systems, and calm technology consulting. We help founders and small businesses build the systems that give them their time back.",
};

export default function ConsultingPage() {
    return (
        <>
            <main>
                <ConsultingHero />
                <ConsultingServices />
                <ConsultingProcess />
                <ConsultingCTA />
            </main>
            <Footer />
        </>
    );
}
