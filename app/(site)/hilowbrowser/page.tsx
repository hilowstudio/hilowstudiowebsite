import type { Metadata } from "next";
import { downloads, getProduct } from "@/lib/site/products";
import { ProductPage } from "@/components/site/product-page";

const product = getProduct("hilowbrowser");

export const metadata: Metadata = {
    title: "Hilow Browser",
    description: product.lead,
};

export default function Page() {
    return (
        <ProductPage
            product={product}
            extra={
                <section className="hl-tile hl-span-12" aria-labelledby="dl-h">
                    <p className="hl-eyebrow">Early access</p>
                    <h2 className="hl-h3" id="dl-h">
                        Download version 0.1.0
                    </h2>
                    <ul className="hl-downloads" style={{ marginTop: 16 }}>
                        {downloads.map((d) => (
                            <li key={d.href}>
                                <a href={d.href}>
                                    <b>{d.platform}</b>
                                    <span>{d.detail}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                    <p className="hl-body hl-measure">
                        The installers aren’t signed yet, so your system will warn you once. On a Mac,
                        right-click the app and choose Open. On Windows, choose More info, then Run anyway.
                    </p>
                </section>
            }
        />
    );
}
