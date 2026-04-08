import Link from "next/link";
import { Metadata } from "next";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Thank You | Hi Low Studio",
    description: "Thanks for your purchase from the Hi Low Studio catalog.",
};

export default function CatalogThanksPage() {
    return (
        <>
            <main className="py-24 md:py-32">
                <div className="container-calm">
                    <div className="max-w-2xl">
                        <p className="text-sm text-ink-muted mb-6">
                            Order Confirmed
                        </p>
                        <h1 className="text-4xl md:text-5xl mb-8">
                            Thanks. We&apos;ve Got It From Here.
                        </h1>
                        <div className="space-y-6 text-ink-muted leading-relaxed mb-12">
                            <p>
                                Your purchase is confirmed. You&apos;ll receive
                                an email from Stripe with your receipt, and a
                                separate email from us within one business day
                                with everything you need to get started.
                            </p>
                            <p className="text-ink font-medium">
                                If you don&apos;t see the second email, check
                                your spam folder or write to us at{" "}
                                <a
                                    href="mailto:hello@hilowstudio.dev"
                                    className="text-clay hover:underline"
                                >
                                    hello@hilowstudio.dev
                                </a>
                                .
                            </p>
                        </div>
                        <Link
                            href="/services/catalog"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-clay text-paper text-sm font-medium hover:bg-clay-muted focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
                        >
                            Back to the catalog
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
