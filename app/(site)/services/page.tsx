import type { Metadata } from "next";
import Link from "next/link";
import { catalogByCategory, categoryMeta, type CatalogCategory } from "@/lib/catalog";

export const metadata: Metadata = {
    title: "Services",
    description:
        "AI, automation, internal systems and web development for community builders, educators, coaches, care providers, nonprofits and the small companies behind them, plus applied AI training for founders and small-business owners.",
};

// Social proof for the studio. It says what the studio has done and for what kinds of
// organizations, never anything a reader could use to pick out a particular client.
// Update the numbers as they change.
const clientStats = [
    { value: "19", label: "clients in the last two years" },
    { value: "20+", label: "hours a week of ongoing builds" },
    { value: "7", label: "fields, from startups to a university" },
];

const clientFields = [
    "Startups",
    "Small businesses",
    "Community builders",
    "Educators and trainers",
    "Coaches and care providers",
    "Nonprofits",
    "Agencies and consultancies",
];

const standards = [
    "You own it: the code, the data and the deployment, with nothing locked behind our account.",
    "It’s documented, so your team can run it without us.",
    "It’s supported week to week as your work changes.",
    "It answers to the same Quiet Standards as our own products.",
];

const offerings = [
    {
        title: "Automation and AI",
        kind: "Build",
        body: "Systems that take the operational work off a team’s plate: intake, CRM workflows, reporting, document generation, client onboarding, and AI where it does real work. You own everything we build.",
    },
    {
        title: "Internal systems",
        kind: "Build",
        body: "The tools a business runs on, built around how the team actually works and supported as it changes.",
    },
    {
        title: "Web development",
        kind: "Build",
        body: "Websites and web apps, designed, built and maintained by one developer who knows the whole thing.",
    },
    {
        title: "Training",
        kind: "Applied AI",
        body: "Applied AI for startup founders and small-business owners, in groups and one-on-one. You build a personal knowledge system, then put AI to work on it so your tools start sounding like you. You leave with a working system.",
    },
    {
        title: "Calm design",
        kind: "Calm technology",
        body: "We apply calm technology to product interfaces and business workflows: systems that stay in the background until they’re needed, degrade gracefully, and respect the attention of the people who use them.",
    },
    {
        title: "Audits",
        kind: "Quiet Standards",
        body: "We measure software against the Quiet Standards Framework and hand you a report: your score, your failures, and a remediation path in priority order. The self-audit toolkit is free.",
    },
];

const steps = [
    {
        title: "Discovery call",
        body: "Thirty minutes on your workflows, your tools and what isn’t working. Free, and there’s no pitch.",
    },
    {
        title: "Recommendation",
        body: "Within a few days, a written plan: what we’d do, how long it takes and what it costs. If we aren’t the right fit, we’ll say so.",
    },
    {
        title: "Delivery",
        body: "We build, teach or design what you need. You get working systems, documentation and full ownership, with nothing locked behind our account.",
    },
    {
        title: "Support",
        body: "An optional monthly retainer for upkeep, changes and new builds as your needs grow.",
    },
];

const order: CatalogCategory[] = ["build", "training", "advisory", "audit", "routine"];

export default function ServicesPage() {
    return (
        <div className="hl-wrap">
            <section className="hl-hero" aria-labelledby="svc-title">
                <div>
                    <p className="hl-eyebrow">Services</p>
                    <h1 className="hl-h1" id="svc-title">
                        Work with the studio.
                    </h1>
                </div>
                <div>
                    <p className="hl-lead">
                        Client work is the larger part of the studio: AI, automation, internal systems and web
                        development, built and then supported week to week, and applied AI training for founders and
                        small-business owners. New work starts with a discovery call or a fixed-scope offering from
                        the catalog.
                    </p>
                    <div className="hl-links" style={{ marginTop: 20 }}>
                        <Link className="hl-btn" href="/book">
                            Book a discovery call
                        </Link>
                        <Link className="hl-link" data-quiet href="/contact">
                            Send a message <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
            </section>

            <div className="hl-bento">
                <section className="hl-tile hl-span-12" data-tone="ink" aria-labelledby="now-h">
                    <p className="hl-eyebrow">Clients</p>
                    <h2 className="hl-h3" id="now-h">
                        Who the studio builds for
                    </h2>
                    <p className="hl-body hl-measure" style={{ marginTop: 12 }}>
                        Some clients work with the studio directly, while others work with us in collaboration with the
                        embedded fractional business operations agencies we partner with to tackle technical builds, AI
                        and automation work.
                    </p>
                    <p className="hl-body hl-measure" style={{ marginTop: 12 }}>
                        Over the last two years, we have supported the meaningful work happening at startups and small
                        businesses across many sectors. What our clients share is work that happens between people:
                        they gather communities, teach, coach and care, and every hour they spend on admin comes out of
                        the time they give the people they serve. We build the systems behind that work so their
                        attention can stay with people.
                    </p>
                    <div className="hl-nums" role="list" style={{ marginTop: 24 }}>
                        {clientStats.map((st) => (
                            <div role="listitem" key={st.label}>
                                <b>{st.value}</b>
                                <span>{st.label}</span>
                            </div>
                        ))}
                    </div>
                    <ul className="hl-chips" aria-label="Fields we build for">
                        {clientFields.map((f) => (
                            <li key={f}>{f}</li>
                        ))}
                    </ul>
                    <h3 className="hl-h3" style={{ fontSize: "1.625rem", marginTop: 16 }}>
                        Every build, the same standard
                    </h3>
                    <ul className="hl-body hl-measure" style={{ paddingLeft: "1.1em", margin: "8px 0 0" }}>
                        {standards.map((line) => (
                            <li key={line} style={{ marginTop: 6 }}>
                                {line}
                            </li>
                        ))}
                    </ul>
                </section>

                <h2 className="hl-sr">What we do</h2>
                {offerings.map((o, i) => (
                    <section key={o.title} className="hl-tile hl-span-4" aria-labelledby={`off-${i}`}>
                        <p className="hl-eyebrow">{o.kind}</p>
                        <h3 className="hl-h3" id={`off-${i}`}>
                            {o.title}
                        </h3>
                        <p className="hl-body" style={{ marginTop: 12 }}>
                            {o.body}
                        </p>
                    </section>
                ))}

                <section className="hl-tile hl-span-12" id="bespoke" aria-labelledby="steps-h">
                    <p className="hl-eyebrow">Bespoke projects</p>
                    <h2 className="hl-h2" id="steps-h" style={{ marginBottom: 24 }}>
                        How a project works
                    </h2>
                    <ol className="hl-steps">
                        {steps.map((s) => (
                            <li key={s.title}>
                                <h3>{s.title}</h3>
                                <p>{s.body}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <div className="hl-span-12" id="catalog">
                    <div className="hl-section-head">
                        <h2 className="hl-h2">The catalog</h2>
                    </div>
                    <p className="hl-lead" style={{ maxWidth: "60ch", marginBottom: 8 }}>
                        Fixed scope and stated prices, for founders who already know what they want. Some you can buy
                        directly, others start with a short conversation.
                    </p>
                </div>

                {order.map((cat) => {
                    const items = catalogByCategory[cat];
                    if (!items.length) return null;
                    return (
                        <section
                            key={cat}
                            className={`hl-tile ${items.length > 3 ? "hl-span-12" : "hl-span-6"}`}
                            aria-labelledby={`cat-${cat}`}
                        >
                            <p className="hl-eyebrow">{categoryMeta[cat].tagline}</p>
                            <h3 className="hl-h3" id={`cat-${cat}`}>
                                {categoryMeta[cat].label}
                            </h3>
                            <ul className="hl-rows" style={{ marginTop: 8 }}>
                                {items.map((item) => (
                                    <li key={item.slug}>
                                        <Link className="hl-row" href={`/services/catalog/${item.slug}`}>
                                            <span className="hl-row-title">{item.name}</span>
                                            <span className="hl-row-price">{item.price}</span>
                                            <span className="hl-row-text">{item.summary}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    );
                })}

                <section className="hl-tile hl-span-12" data-tone="ink" aria-labelledby="unsure-h">
                    <h2 className="hl-h3" id="unsure-h">
                        Not sure which fits?
                    </h2>
                    <p className="hl-body hl-measure" style={{ marginTop: 12 }}>
                        Start with a thirty-minute call. It’s free, and we’ll point you to the right door.
                    </p>
                    <div className="hl-links">
                        <Link className="hl-link" href="/book">
                            Book a discovery call <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
