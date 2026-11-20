import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/site/products";
import { StatusPill } from "./product-tile";

// Sections pair up in halves; a lone last one runs the full width.
function spanFor(i: number, count: number): string {
    if (count % 2 === 1 && i === count - 1) return "hl-span-12";
    return "hl-span-6";
}

/** One page per product: intro beside the facts, then the sections as tiles. */
export function ProductPage({ product, extra }: { product: Product; extra?: React.ReactNode }) {
    return (
        <div className="hl-wrap">
            <p className="hl-crumb">
                <Link href="/#products">Products</Link> <span aria-hidden="true">/</span> {product.name}
            </p>
            <section className="hl-ph" aria-labelledby="p-title">
                <div className="hl-intro">
                    <p className="hl-eyebrow">
                        {product.audience} <StatusPill product={product} />
                    </p>
                    <h1 id="p-title">
                        <Image
                            src={product.mark.src}
                            alt=""
                            width={product.mark.width}
                            height={product.mark.height}
                            data-kind={product.mark.kind}
                            priority
                        />
                        {product.name}
                    </h1>
                    <p className="hl-tag">{product.tagline}</p>
                    <p className="hl-lead">{product.lead}</p>
                    {product.status.note && (
                        <p className="hl-notice" role="status">
                            {product.status.note}
                        </p>
                    )}
                    {(product.primary || product.site) && (
                        <div className="hl-links">
                            {product.primary && (
                                <a className="hl-btn" href={product.primary.href}>
                                    {product.primary.label}
                                </a>
                            )}
                            {product.site && (
                                <a className="hl-link" data-quiet href={product.site.href}>
                                    {product.site.label} <span aria-hidden="true">↗</span>
                                </a>
                            )}
                        </div>
                    )}
                </div>
                <aside className="hl-tile" data-tone="ink" aria-labelledby="facts-h">
                    <p className="hl-eyebrow" id="facts-h">
                        Product facts
                    </p>
                    <dl className="hl-facts">
                        {product.facts.map((f) => (
                            <div key={f.label}>
                                <dt>{f.label}</dt>
                                <dd>{f.value}</dd>
                            </div>
                        ))}
                    </dl>
                </aside>
            </section>

            <div className="hl-bento" aria-label={`About ${product.name}`}>
                {extra}
                {product.sections.map((s, i) => (
                    <section
                        key={s.heading}
                        className={`hl-tile ${spanFor(i, product.sections.length)}`}
                        aria-labelledby={`s-${i}`}
                    >
                        <h2 className="hl-h3" id={`s-${i}`}>
                            {s.heading}
                        </h2>
                        <div className="hl-body" style={{ marginTop: 12 }}>
                            {s.body.map((p) => (
                                <p key={p}>{p}</p>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
