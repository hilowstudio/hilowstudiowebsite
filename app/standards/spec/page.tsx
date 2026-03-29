import { Metadata } from "next";
import { SpecContent } from "@/components/standards/spec-content";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "QSF Full Specification | Hi-Low Studio",
    description:
        "The complete Quiet Standards Framework specification. 104 auditable criteria across 7 domains for attention-respecting software.",
};

export default function SpecPage() {
    return (
        <>
            <main>
                <SpecContent />
            </main>
            <Footer />
        </>
    );
}
