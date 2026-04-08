import { Metadata } from "next";
import { ServicesHero } from "@/components/services/overview/services-hero";
import { ServicesTwoDoors } from "@/components/services/overview/services-two-doors";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Services | Hi-Low Studio",
    description:
        "Two ways to work with Hi-Low Studio: bespoke engagements scoped to your business, or a catalog of fixed-scope custom builds, workshops, advisory, and Quiet Standards audits.",
};

export default function ServicesPage() {
    return (
        <>
            <main>
                <ServicesHero />
                <ServicesTwoDoors />
            </main>
            <Footer />
        </>
    );
}
