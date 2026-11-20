import type { MetadataRoute } from "next";
import { getCatalogSlugs } from "@/lib/catalog";
import { products } from "@/lib/site/products";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://hilowstudio.dev";

    const pages = [
        "",
        ...products.map((p) => `/${p.slug}`),
        "/standards",
        "/standards/spec",
        "/services",
        "/about",
        "/contact",
        "/book",
        "/privacy",
        "/changelog",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        changeFrequency: "monthly" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    const catalogPages = getCatalogSlugs().map((slug) => ({
        url: `${baseUrl}/services/catalog/${slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.6,
    }));

    return [...pages, ...catalogPages];
}
