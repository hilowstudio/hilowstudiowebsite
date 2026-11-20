import type { Metadata } from "next";
import Link from "next/link";
import { domains } from "@/lib/site/qsf";
import { tiers, evidenceTypes } from "@/lib/site/qsf";
import { landscape } from "@/lib/site/qsf";

export const metadata: Metadata = {
    title: "Quiet Standards Framework",
    description:
        "An open, auditable standard for how software treats your attention, your data and your right to leave. 104 criteria in 7 domains, with 27 gates to pass.",
};

export default function StandardsPage() {
    return (
        <div className="hl-wrap">
            <section className="hl-hero" aria-labelledby="qsf-title">
                <div>
                    <p className="hl-eyebrow">The Quiet Standards Framework</p>
                    <h1 className="hl-h1" id="qsf-title" style={{ maxWidth: "15ch" }}>
                        A standard for software that respects <em>attention</em>.
                    </h1>
                </div>
                <div>
                    <p className="hl-lead">
                        Accessibility has WCAG. Privacy has GDPR. Hardware has the Calm Tech Institute. The Quiet
                        Standards Framework covers how software treats your attention, your data and your right to
                        leave, and it’s written so two independent auditors reach the same result.
                    </p>
                    <div className="hl-links" style={{ marginTop: 20 }}>
                        <Link className="hl-btn" href="/standards/spec">
                            Read the specification
                        </Link>
                        <a className="hl-link" data-quiet href="/qsf-v1.pdf">
                            Download the PDF <span aria-hidden="true">↓</span>
                        </a>
                    </div>
                </div>
            </section>

            <div className="hl-bento">
                <section className="hl-tile hl-span-12" data-tone="ink" aria-labelledby="nums-h">
                    <h2 className="hl-sr" id="nums-h">
                        The framework in numbers
                    </h2>
                    <div className="hl-nums" role="list" style={{ margin: 0 }}>
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
                            <span>gates every product must pass</span>
                        </div>
                        <div role="listitem">
                            <b>143</b>
                            <span>scorable points</span>
                        </div>
                    </div>
                </section>

                <div className="hl-span-12">
                    <h2 className="hl-h2" style={{ margin: "24px 0 4px" }}>
                        Seven domains
                    </h2>
                </div>
                {domains.map((d) => (
                    <section key={d.number} className="hl-tile hl-span-4" aria-labelledby={`d-${d.number}`}>
                        <p className="hl-eyebrow">
                            {d.number} · {d.criteria} criteria · {d.mustPass} {d.mustPass === 1 ? "gate" : "gates"}
                        </p>
                        <h3 className="hl-h3" id={`d-${d.number}`}>
                            {d.title}
                        </h3>
                        <p className="hl-tag">{d.principle}</p>
                        <ul className="hl-body" style={{ paddingLeft: "1.1em", margin: 0 }}>
                            {d.examples.map((e) => (
                                <li key={e} style={{ marginTop: 6 }}>
                                    {e}
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}

                <section className="hl-tile hl-span-8" data-tone="warm" aria-labelledby="tiers-h">
                    <p className="hl-eyebrow">Scoring</p>
                    <h2 className="hl-h3" id="tiers-h">
                        Three tiers
                    </h2>
                    <ul className="hl-rows" style={{ marginTop: 8 }}>
                        {tiers.map((t) => (
                            <li key={t.name} className="hl-row">
                                <span className="hl-row-title">{t.name}</span>
                                <span className="hl-row-price">
                                    {t.points} points ({t.threshold})
                                </span>
                                <span className="hl-row-text">{t.description}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="hl-tile hl-span-12" aria-labelledby="ev-h">
                    <p className="hl-eyebrow">How criteria are checked</p>
                    <h2 className="hl-h3" id="ev-h">
                        Four kinds of evidence
                    </h2>
                    <ol className="hl-steps" style={{ marginTop: 20 }}>
                        {evidenceTypes.map((e) => (
                            <li key={e.code}>
                                <h3>
                                    {e.label} <span className="hl-sr">({e.code})</span>
                                </h3>
                                <p>{e.description}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="hl-tile hl-span-12" aria-labelledby="land-h">
                    <p className="hl-eyebrow">Where it fits</p>
                    <h2 className="hl-h3" id="land-h">
                        The work it sits beside
                    </h2>
                    <p className="hl-body hl-measure" style={{ marginTop: 12 }}>
                        Good work on ethical technology already exists in advocacy, hardware certification, privacy
                        law, accessibility and process standards. The framework adds a product-level, auditable test
                        for software, meant to sit beside the others.
                    </p>
                    <ul className="hl-rows">
                        {landscape.map((l) => (
                            <li key={l.label} className="hl-row">
                                <span className="hl-row-title">{l.label}</span>
                                <span className="hl-row-price">
                                    {l.status}, {l.scope.toLowerCase()}
                                </span>
                                <span className="hl-row-text">{l.note}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="hl-tile hl-span-12" data-tone="ink" aria-labelledby="use-h">
                    <h2 className="hl-h3" id="use-h">
                        Use it
                    </h2>
                    <p className="hl-body hl-measure" style={{ marginTop: 12 }}>
                        The specification is open, and the self-audit skill is free to run with Claude Code. For a
                        guided audit of your product, the studio can help.
                    </p>
                    <div className="hl-links">
                        <Link className="hl-link" href="/services/catalog/qsf-self-audit-skill">
                            Get the self-audit skill <span aria-hidden="true">→</span>
                        </Link>
                        <Link className="hl-link" href="/services/catalog/qsf-guided-audit">
                            Guided audits <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
