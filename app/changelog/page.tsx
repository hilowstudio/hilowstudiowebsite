import { Metadata } from "next";
import { ChangelogContent } from "@/components/changelog/changelog-content";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Changelog | Hi-Low Studio",
    description:
        "What we've added, changed, and removed on hilowstudio.dev.",
};

export default function ChangelogPage() {
    return (
        <>
            <main>
                <ChangelogContent />
            </main>
            <Footer />
        </>
    );
}
