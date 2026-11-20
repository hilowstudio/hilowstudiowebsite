import type { Metadata } from "next";
import Link from "next/link";
import { ReactivePortrait } from "@/components/site/reactive-portrait";

export const metadata: Metadata = {
    title: "About",
    description:
        "Hi Low Studio is a calm-tech studio in Naperville, Illinois, founded by Adam Vega. It makes software for study, school and focus, and builds the systems behind small teams’ work.",
};

const parts = [
    {
        id: "products",
        title: "Products",
        body: "Four tools for study, school and focus. Each one is built to be used and put down.",
        href: "/#products",
        cta: "See the products",
    },
    {
        id: "services",
        title: "Consulting",
        body: "Week-to-week AI, automation, internal-systems and web work for community builders, educators, coaches, care providers, nonprofits and the small companies behind them. Some clients work with the studio directly, and others come through the fractional operations agencies we partner with. We also teach applied AI to startup founders and small-business owners with a founder-training partner. It’s the larger part of the studio, and it pays for the products.",
        href: "/services",
        cta: "See the consulting work",
    },
    {
        id: "standard",
        title: "The standard",
        body: "The Quiet Standards Framework: 104 criteria for how software treats attention, data and the right to leave. It keeps the products honest and gives client work something firm to measure against.",
        href: "/standards",
        cta: "Read the framework",
    },
];

export default function AboutPage() {
    return (
        <div className="hl-wrap">
            <section className="hl-ph" aria-labelledby="about-title">
                <div className="hl-intro">
                    <p className="hl-eyebrow">The founder</p>
                    <h1 id="about-title">Hi, I’m Adam.</h1>
                    <p className="hl-lead">
                        I founded Hi Low Studio to build calm software for families, schools and anyone trying to
                        keep their attention for the people in front of them.
                    </p>
                </div>
                <ReactivePortrait />
            </section>

            <div className="hl-bento">
                <section className="hl-tile hl-span-7 hl-rows-2" aria-labelledby="story-h">
                    <h2 className="hl-sr" id="story-h">
                        My story
                    </h2>
                    <div className="hl-prose">
                        <p>I’m a technologist and a teacher. I’m married, I have three boys, and we live in Naperville.</p>
                        <p>
                            Before the studio, I spent a decade in healthcare operations tackling hospital
                            telecommunications, information security, and clinical team management. I also spent eight
                            years, concurrently, planting a church. That church was the work I loved most and the work
                            that broke me. It ended in burnout and rendering myself unfit to continue in ministry. In
                            the aftermath, I have learned that compartmentalization and masking of self are not
                            sustainable.
                        </p>
                        <p>
                            One lesson I took out of that season is that I am no longer willing to build work on top
                            of a version of myself that isn’t real, and I don’t think anyone else should have to
                            either.
                        </p>
                        <p>
                            Every job I’ve loved has been the same act: gathering people around a mission, teaching
                            hard things plainly, and building the quiet systems that let real care happen. Hi Low Studio is
                            what happens when I stop running those on separate tracks.
                        </p>
                        <p>
                            If you’re an ADHD founder wondering whether you can bring your whole brain to your work:
                            you can.
                        </p>
                        <p className="hl-sign">Adam</p>
                    </div>
                </section>

                <aside className="hl-tile hl-span-5" data-tone="ink" aria-labelledby="glance-h">
                    <p className="hl-eyebrow" id="glance-h">
                        The studio at a glance
                    </p>
                    <dl className="hl-facts">
                        <div>
                            <dt>Founded by</dt>
                            <dd>Adam Vega</dd>
                        </div>
                        <div>
                            <dt>Where</dt>
                            <dd>Naperville, Illinois</dd>
                        </div>
                        <div>
                            <dt>Makes</dt>
                            <dd>Ongoing AI, automation and web work for clients, applied AI training for founders, four products, and one open standard</dd>
                        </div>
                        <div>
                            <dt>Paid for by</dt>
                            <dd>Consulting, which earns most of the studio’s income, and product sales. No investors, no ads, no data sales.</dd>
                        </div>
                    </dl>
                </aside>

                <section className="hl-tile hl-span-5" data-tone="warm" aria-labelledby="money-h">
                    <h2 className="hl-h3" id="money-h">
                        How the studio stays honest
                    </h2>
                    <p className="hl-body" style={{ marginTop: 12 }}>
                        Hi Low Studio is bootstrapped. We don’t sell data, we don’t run ads, and we don’t take
                        investment that would make us chase growth we don’t believe in. If that ever changes,
                        we’ll say so on this page before it takes effect.
                    </p>
                </section>

                {parts.map((p) => (
                    <section key={p.title} className="hl-tile hl-span-4" aria-labelledby={`part-${p.id}`}>
                        <h2 className="hl-h3" id={`part-${p.id}`}>
                            {p.title}
                        </h2>
                        <p className="hl-body" style={{ marginTop: 12 }}>
                            {p.body}
                        </p>
                        <div className="hl-links">
                            <Link className="hl-link" href={p.href}>
                                {p.cta} <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </section>
                ))}

                <section className="hl-tile hl-span-12" aria-labelledby="touch-h">
                    <h2 className="hl-h3" id="touch-h">
                        Get in touch
                    </h2>
                    <p className="hl-body hl-measure" style={{ marginTop: 12 }}>
                        Write to <a href="mailto:hello@hilowstudio.dev">hello@hilowstudio.dev</a>. We read every message
                        and reply within 2 business days.
                    </p>
                    <div className="hl-links">
                        <a className="hl-btn" href="mailto:hello@hilowstudio.dev">
                            Write an email
                        </a>
                        <Link className="hl-link" href="/book">
                            Book a discovery call <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
