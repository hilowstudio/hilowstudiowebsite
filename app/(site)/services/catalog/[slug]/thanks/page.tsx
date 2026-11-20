import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Thank you",
    description: "Your purchase from the Hi Low Studio catalog is confirmed.",
};

export default function CatalogThanksPage() {
    return (
        <div className="hl-wrap">
            <section className="hl-page-hero" aria-labelledby="ty-title" style={{ paddingBottom: 96 }}>
                <p className="hl-eyebrow">Order confirmed</p>
                <h1 className="hl-h1" id="ty-title">
                    Thank you.
                </h1>
                <div className="hl-prose" style={{ marginTop: 20 }}>
                    <p>
                        Your purchase is confirmed. Stripe will email your receipt, and we’ll send a separate email
                        within one business day with everything you need to get started.
                    </p>
                    <p>
                        If the second email doesn’t arrive, check your spam folder or write to{" "}
                        <a href="mailto:hello@hilowstudio.dev">hello@hilowstudio.dev</a>.
                    </p>
                </div>
                <div className="hl-links" style={{ marginTop: 24 }}>
                    <Link className="hl-btn" href="/services#catalog">
                        Back to the catalog
                    </Link>
                </div>
            </section>
        </div>
    );
}
