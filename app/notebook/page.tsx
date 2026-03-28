import { Metadata } from "next";
import { NotebookHero } from "@/components/notebook/notebook-hero";
import { NotebookGrid } from "@/components/notebook/notebook-grid";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Notebook | Hi-Low Studio",
    description:
        "Essays and reflections on building for the parallel economy.",
};

export default function NotebookPage() {
    return (
        <>
            <main>
                <NotebookHero />
                <NotebookGrid />
            </main>
            <Footer />
        </>
    );
}
