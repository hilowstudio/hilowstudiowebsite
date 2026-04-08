import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalogItem, getCatalogSlugs } from "@/lib/catalog";
import { CatalogItemHero } from "@/components/services/catalog/catalog-item-hero";
import { CatalogItemBody } from "@/components/services/catalog/catalog-item-body";
import { CatalogItemIncludes } from "@/components/services/catalog/catalog-item-includes";
import { CatalogItemMeta } from "@/components/services/catalog/catalog-item-meta";
import { CatalogItemCTA } from "@/components/services/catalog/catalog-item-cta";
import { Footer } from "@/components/footer";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return getCatalogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const item = getCatalogItem(slug);

    if (!item) {
        return { title: "Not Found | Hi Low Studio" };
    }

    return {
        title: `${item.name} | Catalog | Hi Low Studio`,
        description: item.summary,
    };
}

export default async function CatalogItemPage({ params }: PageProps) {
    const { slug } = await params;
    const item = getCatalogItem(slug);

    if (!item) {
        notFound();
    }

    return (
        <>
            <main>
                <CatalogItemHero item={item} />
                <CatalogItemBody item={item} />
                <CatalogItemIncludes item={item} />
                <CatalogItemMeta item={item} />
                <CatalogItemCTA item={item} />
            </main>
            <Footer />
        </>
    );
}
