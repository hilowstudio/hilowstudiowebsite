import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryMeta, getCatalogItem, getCatalogSlugs } from "@/lib/catalog";
import { InquiryForm } from "@/components/services/catalog/inquiry-form";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return getCatalogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const item = getCatalogItem(slug);
    if (!item) return { title: "Not found" };
    return { title: `${item.name} · Services`, description: item.summary };
}

export default async function CatalogItemPage({ params }: PageProps) {
    const { slug } = await params;
    const item = getCatalogItem(slug);
    if (!item) notFound();

    const facts = [
        { label: "Price", value: item.priceNote ? `${item.price}. ${item.priceNote}` : item.price },
        item.timeline && { label: "Timeline", value: item.timeline },
        item.scope && { label: "Scope", value: item.scope },
        item.prerequisites && { label: "You'll need", value: item.prerequisites },
    ].filter(Boolean) as { label: string; value: string }[];

    return (
        <div className="hl-wrap">
            <p className="hl-crumb">
                <Link href="/services">Services</Link> <span aria-hidden="true">/</span>{" "}
                <Link href="/services#catalog">Catalog</Link> <span aria-hidden="true">/</span> {item.name}
            </p>
            <section className="hl-page-hero" aria-labelledby="item-title" style={{ paddingTop: 16 }}>
                <p className="hl-eyebrow">{categoryMeta[item.category].label}</p>
                <h1 className="hl-h1" id="item-title" style={{ maxWidth: "18ch" }}>
                    {item.name}
                </h1>
                <p className="hl-lead">{item.summary}</p>
            </section>

            <div className="hl-bento">
                <section className="hl-tile hl-span-7" aria-labelledby="about-h">
                    <h2 className="hl-h3" id="about-h">
                        About this offering
                    </h2>
                    <div className="hl-prose" style={{ marginTop: 12 }}>
                        {item.description.map((p) => (
                            <p key={p}>{p}</p>
                        ))}
                        {item.outcomes && item.outcomes.length > 0 && (
                            <>
                                <h3>What you leave with</h3>
                                <ul>
                                    {item.outcomes.map((o) => (
                                        <li key={o}>{o}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </section>

                <aside className="hl-tile hl-span-5" data-tone="ink" aria-labelledby="shape-h">
                    <p className="hl-eyebrow" id="shape-h">
                        The shape of it
                    </p>
                    <dl className="hl-facts">
                        {facts.map((f) => (
                            <div key={f.label}>
                                <dt>{f.label}</dt>
                                <dd>{f.value}</dd>
                            </div>
                        ))}
                    </dl>
                </aside>

                <section className="hl-tile hl-span-5" data-tone="warm" aria-labelledby="inc-h">
                    <h2 className="hl-h3" id="inc-h">
                        What’s included
                    </h2>
                    <ul className="hl-body" style={{ paddingLeft: "1.1em", margin: "12px 0 0" }}>
                        {item.includes.map((line) => (
                            <li key={line} style={{ marginTop: 6 }}>
                                {line}
                            </li>
                        ))}
                    </ul>
                </section>

                {item.cta.kind === "buy" ? (
                    <section className="hl-tile hl-span-12" aria-labelledby="buy-h">
                        <h2 className="hl-h3" id="buy-h">
                            Ready when you are
                        </h2>
                        <p className="hl-body hl-measure" style={{ marginTop: 12 }}>
                            Payment happens on Stripe’s page. You’ll get a receipt from Stripe and an email from
                            us within one business day with everything you need.
                        </p>
                        <div className="hl-links">
                            <a className="hl-btn" href={item.cta.stripeUrl}>
                                {item.cta.ctaLabel ?? "Buy"} on Stripe
                            </a>
                        </div>
                    </section>
                ) : (
                    <section className="hl-tile hl-span-12" aria-labelledby="ask-h">
                        <p className="hl-eyebrow">Start a conversation</p>
                        <h2 className="hl-h3" id="ask-h">
                            Tell us about your project
                        </h2>
                        <p className="hl-body hl-measure" style={{ marginTop: 12 }}>
                            Send a short note about what you’re working on. We reply within two business days,
                            with no pitch.
                        </p>
                        <div className="hl-legacy" style={{ maxWidth: 640 }}>
                            <InquiryForm
                                catalogSlug={item.slug}
                                catalogName={item.name}
                                submitLabel={item.cta.ctaLabel ?? "Send inquiry"}
                            />
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
