import Link from "next/link";
import { SiteShell } from "@/components/site/site-shell";

export default function NotFound() {
    return (
        <SiteShell>
            <div className="hl-wrap">
                <section className="hl-page-hero" aria-labelledby="nf-title" style={{ paddingBottom: 120 }}>
                    <p className="hl-eyebrow">404</p>
                    <h1 className="hl-h1" id="nf-title">
                        This page isn’t here.
                    </h1>
                    <p className="hl-lead">It may have moved, or the address may have a typo.</p>
                    <div className="hl-links" style={{ marginTop: 24 }}>
                        <Link className="hl-btn" href="/">
                            Go to the home page
                        </Link>
                        <Link className="hl-link" data-quiet href="/contact">
                            Contact the studio <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </section>
            </div>
        </SiteShell>
    );
}
