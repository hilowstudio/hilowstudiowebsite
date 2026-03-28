import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://hilowstudio.dev";

    // Static pages
    const staticPages = [
        "",
        "/work",
        "/consulting",
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

    return [...staticPages, ...notebookEntries];
}
