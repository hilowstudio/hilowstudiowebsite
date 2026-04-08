import { Metadata } from "next";
import { catalogItems } from "@/lib/catalog";
import { CatalogHero } from "@/components/services/catalog/catalog-hero";
import { CatalogGrid } from "@/components/services/catalog/catalog-grid";
import { CatalogCTA } from "@/components/services/catalog/catalog-cta";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Catalog | Services | Hi Low Studio",
    description:
        "Fixed-scope custom builds, workshops, advisory retainers, and Quiet Standards audits from Hi Low Studio. Calm tech, off the shelf.",
};

export default function CatalogPage() {
    return (
        <>
            <main>
                <CatalogHero />
                <CatalogGrid items={catalogItems} />
                <CatalogCTA />
            </main>
            <Footer />
        </>
    );
}
