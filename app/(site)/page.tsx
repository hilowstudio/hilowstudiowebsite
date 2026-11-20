import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getProduct } from "@/lib/site/products";
import { ProductTile, ProductTileLarge } from "@/components/site/product-tile";

export const metadata: Metadata = {
    title: { absolute: "Hi Low Studio | Digital supports for analog living" },
    description:
        "Hi Low Studio builds AI, automation and web systems for small businesses and organizations, and makes small, calm software for study, school and focus: Exegetica, Quill & Compass, Podcatch and Hilow Browser.",
};

export default function Home() {
    return (
        <div className="hl-wrap">
            <section className="hl-hero" aria-labelledby="home-title">
                <h1 className="hl-h1" id="home-title">
                    Digital supports for <em>analog</em> living.
                </h1>
                <p className="hl-lead">
                    Hi Low Studio makes small, calm software for study, school and focus, and builds AI, automation
                    and web systems for the businesses it works with. Each tool does its job and then gets out of the
                    way.
                </p>
            </section>

            <div className="hl-bento" id="products">
                <h2 className="hl-sr">Products</h2>
                <ProductTileLarge product={getProduct("exegetica")} className="hl-span-7 hl-rows-2" />
                <ProductTile product={getProduct("quillandcompass")} className="hl-span-5" />
                <ProductTile product={getProduct("podcatch")} className="hl-span-5" />
                <ProductTile product={getProduct("hilowbrowser")} className="hl-span-5" />

                <section className="hl-tile hl-span-7" data-tone="ink" aria-labelledby="qsf-h">
                    <p className="hl-eyebrow">The standard we build to</p>
                    <h2 className="hl-h3" id="qsf-h">
                        The Quiet Standards Framework
                    </h2>
                    <div className="hl-nums" role="list">
                        <div role="listitem">
                            <b>104</b>
                            <span>criteria</span>
                        </div>
                        <div role="listitem">
                            <b>7</b>
                            <span>domains</span>
                        </div>
                        <div role="listitem">
                            <b>27</b>
                            <span>gates to pass</span>
                        </div>
                    </div>
                    <p className="hl-body">
                        We wrote it to measure how software treats your attention, your data and your right to leave.
                        It’s open, and anyone can run the self-audit.
                    </p>
                    <div className="hl-links">
                        <Link className="hl-link" href="/standards">
                            Read the framework <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </section>

                <section className="hl-tile hl-span-7 hl-person" aria-labelledby="studio-h">
                    <Image src="/site/adam.webp" alt="Adam Vega, the studio’s founder" width={1000} height={1000} sizes="88px" />
                    <div>
                        <p className="hl-eyebrow" id="studio-h">
                            The studio
                        </p>
                        <p className="hl-body">
                            Hi Low Studio is a calm-tech studio in Naperville, Illinois, founded by Adam Vega. It makes
                            its own products and builds the systems behind small teams’ work.
                        </p>
                        <div className="hl-links">
                            <Link className="hl-link" href="/about">
                                About the studio <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="hl-tile hl-span-5" data-tone="warm" aria-labelledby="work-h">
                    <p className="hl-eyebrow" id="work-h">
                        Consulting
                    </p>
                    <p className="hl-body">
                        Client work is the larger part of the studio: AI, automation, internal systems and web
                        development for community builders, educators, coaches, care providers, nonprofits and the
                        small companies behind them, plus applied AI training for founders and small-business
                        owners.
                    </p>
                    <div className="hl-links">
                        <Link className="hl-link" href="/services">
                            Work with the studio <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
