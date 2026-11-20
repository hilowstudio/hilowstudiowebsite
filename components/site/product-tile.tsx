import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/site/products";

export function StatusPill({ product }: { product: Product }) {
    return (
        <span className="hl-pill" data-tone={product.status.tone}>
            {product.status.label}
        </span>
    );
}

/** The large tile: art panel on top, chips, two links. */
export function ProductTileLarge({ product, className = "" }: { product: Product; className?: string }) {
    return (
        <article className={`hl-tile ${className}`} aria-labelledby={`t-${product.slug}`}>
            <div className="hl-art hl-dither">
                <Image
                    src={product.mark.src}
                    alt=""
                    width={product.mark.width}
                    height={product.mark.height}
                    data-kind={product.mark.kind}
                />
            </div>
            <p className="hl-eyebrow">
                {product.audience} <StatusPill product={product} />
            </p>
            <h2 className="hl-h2" id={`t-${product.slug}`}>
                {product.name}
            </h2>
            <p className="hl-tag">{product.tagline}</p>
            <p className="hl-body">{product.summary}</p>
            {product.chips.length > 0 && (
                <ul className="hl-chips" aria-label={`${product.name} at a glance`}>
                    {product.chips.map((c) => (
                        <li key={c}>{c}</li>
                    ))}
                </ul>
            )}
            <div className="hl-links">
                <Link className="hl-link" href={`/${product.slug}`}>
                    About {product.name} <span aria-hidden="true">→</span>
                </Link>
                {product.site && (
                    <a className="hl-link" data-quiet href={product.site.href}>
                        {product.site.label} <span aria-hidden="true">↗</span>
                    </a>
                )}
            </div>
        </article>
    );
}

/** The smaller tile: mark in the corner. */
export function ProductTile({ product, className = "" }: { product: Product; className?: string }) {
    return (
        <article className={`hl-tile ${className}`} aria-labelledby={`t-${product.slug}`}>
            <Image
                className="hl-corner-mark"
                src={product.mark.src}
                alt=""
                width={product.mark.width}
                height={product.mark.height}
            />
            <p className="hl-eyebrow">
                {product.audience} <StatusPill product={product} />
            </p>
            <h2 className="hl-h3" id={`t-${product.slug}`}>
                {product.name}
            </h2>
            <p className="hl-tag">{product.tagline}</p>
            <p className="hl-body">{product.summary}</p>
            <div className="hl-links">
                <Link className="hl-link" href={`/${product.slug}`}>
                    About {product.name} <span aria-hidden="true">→</span>
                </Link>
            </div>
        </article>
    );
}
