import type { Metadata } from "next";
import { getProduct } from "@/lib/site/products";
import { ProductPage } from "@/components/site/product-page";

const product = getProduct("podcatch");

export const metadata: Metadata = {
    title: "Podcatch",
    description: product.lead,
};

export default function Page() {
    return <ProductPage product={product} />;
}
