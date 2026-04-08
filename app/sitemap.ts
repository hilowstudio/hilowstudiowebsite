import type { MetadataRoute } from "next";
import { getCatalogSlugs } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://hilowstudio.dev";

    // Static pages
    const staticPages = [
        "",
        "/about",
        "/work",
        "/services",
        "/services/bespoke",
        "/services/catalog",
        "/notebook",
        "/contact",
        "/book",
        "/hilowbrowser",
        "/quillandcompass",
        "/podcatch",
        "/kinandcairn",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    // Catalog detail pages (dynamically generated from lib/catalog.ts)
    const catalogPages = getCatalogSlugs().map((slug) => ({
        url: `${baseUrl}/services/catalog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    // Notebook entries (in production, these would be dynamically generated)
    const notebookEntries = [
        "/notebook/the-quiet-exodus",
        "/notebook/why-calm-tech",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.6,
    }));

    return [...staticPages, ...catalogPages, ...notebookEntries];
}
