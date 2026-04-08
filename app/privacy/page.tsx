import { Metadata } from "next";
import { PrivacyContent } from "@/components/privacy/privacy-content";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Privacy Policy | Hi Low Studio",
    description:
        "How Hi Low Studio handles your data. No analytics, no tracking, no cookies. We collect only what you explicitly provide.",
};

export default function PrivacyPage() {
    return (
        <>
            <main>
                <PrivacyContent />
            </main>
            <Footer />
        </>
    );
}
