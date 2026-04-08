import { CatalogItem } from "@/lib/catalog";
import { BuyButton } from "./buy-button";
import { InquiryForm } from "./inquiry-form";

interface CatalogItemCTAProps {
    item: CatalogItem;
}

export function CatalogItemCTA({ item }: CatalogItemCTAProps) {
    if (item.cta.kind === "buy") {
        return (
            <section className="py-24">
                <div className="container-calm">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="w-12 h-px bg-ink/20 mx-auto mb-12" />

                        <h2 className="text-3xl md:text-4xl mb-8">
                            Ready When You Are
                        </h2>

                        <p className="text-ink-muted leading-relaxed mb-12 max-w-lg mx-auto">
                            Purchase below and you&apos;ll get a confirmation
                            email with everything you need to get started.
                        </p>

                        <BuyButton
                            stripeUrl={item.cta.stripeUrl}
                            label={item.cta.ctaLabel ?? "Buy now"}
                        />

                        <div className="w-12 h-px bg-ink/20 mx-auto mt-12" />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24">
            <div className="container-calm">
                <div className="max-w-3xl">
                    <p className="text-xs uppercase tracking-widest text-ink-light mb-6">
                        Start a Conversation
                    </p>
                    <h2 className="text-3xl md:text-4xl mb-6">
                        Tell Us About Your Project
                    </h2>
                    <p className="text-ink-muted leading-relaxed mb-12 max-w-xl">
                        Send a short note about what you&apos;re working on and
                        we&apos;ll get back to you within two business days. No
                        pitch, no pressure.
                    </p>

                    <InquiryForm
                        catalogSlug={item.slug}
                        catalogName={item.name}
                        submitLabel={item.cta.ctaLabel ?? "Send Inquiry"}
                    />
                </div>
            </div>
        </section>
    );
}
