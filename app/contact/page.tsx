import { Suspense } from "react";
import { Metadata } from "next";
import { ContactHero } from "@/components/contact/contact-hero";
import { ContactForm } from "@/components/contact/contact-form";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Contact | Hi-Low Studio",
    description:
        "Get in touch with Hi-Low Studio. Let's build something for the parallel economy.",
};

export default function ContactPage() {
    return (
        <>
            <main>
                <ContactHero />
                <Suspense fallback={null}>
                    <ContactForm />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}
