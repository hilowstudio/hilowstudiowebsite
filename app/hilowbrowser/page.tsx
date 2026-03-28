import { Metadata } from "next";
import { BrowserHero } from "@/components/hilowbrowser/browser-hero";
import { BrowserDownloads } from "@/components/hilowbrowser/browser-downloads";
import { BrowserFeatures } from "@/components/hilowbrowser/browser-features";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Hilow Browser | Hi-Low Studio",
    description:
        "A desktop browser that treats your attention as something worth protecting. Designed as a cognitive support tool for people with ADHD and anyone who wants their focus back.",
};

export default function HilowBrowserPage() {
    return (
        <>
            <main>
                <BrowserHero />
                <BrowserDownloads />
                <BrowserFeatures />
            </main>
            <Footer />
        </>
    );
}
