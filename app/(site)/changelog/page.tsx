import type { Metadata } from "next";
import { changelog } from "@/lib/site/changelog";

export const metadata: Metadata = {
    title: "Changelog",
    description: "What we've added, changed and removed on hilowstudio.dev.",
};

export default function ChangelogPage() {
    return (
        <div className="hl-wrap">
            <section className="hl-page-hero" aria-labelledby="cl-title">
                <p className="hl-eyebrow">Transparency</p>
                <h1 className="hl-h1" id="cl-title">
                    Changelog
                </h1>
                <p className="hl-lead">What we’ve added, changed and removed on this site.</p>
            </section>
            <div className="hl-bento">
                {changelog.map((entry) => (
                    <section
                        key={`${entry.date}-${entry.title}`}
                        className="hl-tile hl-span-8"
                        aria-label={`${entry.title}, ${entry.date}`}
                    >
                        <p className="hl-eyebrow">
                            <time>{entry.date}</time>
                        </p>
                        <h2 className="hl-h3">{entry.title}</h2>
                        <ul className="hl-body hl-measure" style={{ paddingLeft: "1.1em", margin: "12px 0 0" }}>
                            {entry.changes.map((c) => (
                                <li key={c} style={{ marginTop: 6 }}>
                                    {c}
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </div>
    );
}
