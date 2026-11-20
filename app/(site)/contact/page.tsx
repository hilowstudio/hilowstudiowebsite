import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmail } from "@/components/site/copy-email";

export const metadata: Metadata = {
    title: "Contact",
    description: "Write to Hi Low Studio at hello@hilowstudio.dev, or book a free 30-minute discovery call.",
};

const EMAIL = "hello@hilowstudio.dev";

export default function ContactPage() {
    return (
        <div className="hl-wrap">
            <section className="hl-page-hero" aria-labelledby="ct-title">
                <p className="hl-eyebrow">Contact</p>
                <h1 className="hl-h1" id="ct-title">
                    Write to the studio.
                </h1>
                <p className="hl-lead">
                    Questions about a product, a school or family looking at Exegetica or Quill &amp; Compass, or a
                    project you’d like help with. We read every message and reply within 2 business days.
                </p>
            </section>
            <div className="hl-bento">
                <section className="hl-tile hl-span-7" aria-labelledby="mail-h">
                    <p className="hl-eyebrow" id="mail-h">
                        Email
                    </p>
                    <p style={{ font: "400 clamp(1.75rem, 4vw, 2.5rem)/1.1 var(--hl-display)", overflowWrap: "anywhere" }}>
                        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                    </p>
                    <div className="hl-links" style={{ marginTop: 20 }}>
                        <a className="hl-btn" href={`mailto:${EMAIL}`}>
                            Write an email
                        </a>
                        <CopyEmail email={EMAIL} />
                    </div>
                </section>
                <section className="hl-tile hl-span-5" data-tone="warm" aria-labelledby="call-h">
                    <p className="hl-eyebrow">For projects</p>
                    <h2 className="hl-h3" id="call-h">
                        Book a discovery call
                    </h2>
                    <p className="hl-body" style={{ marginTop: 12 }}>
                        Thirty minutes on video, free, with no pitch. Pick a time and you’ll get a Google Meet
                        link.
                    </p>
                    <div className="hl-links">
                        <Link className="hl-link" href="/book">
                            Pick a time <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
