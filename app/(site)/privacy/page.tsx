import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy policy",
    description:
        "How Hi Low Studio handles your data on hilowstudio.dev: what we collect, the services that receive it, how long we keep it, and how to have it deleted.",
};

const EMAIL = "hello@hilowstudio.dev";

const services = [
    {
        name: "Supabase",
        use: "Stores the details you send through the booking and catalog inquiry forms in our contact records, so we can follow up.",
        policy: "https://supabase.com/privacy",
    },
    {
        name: "Google Calendar",
        use: "Creates the calendar event for a discovery call from your name, email, message and chosen time. We use a service account and never touch your own Google account.",
        policy: "https://policies.google.com/privacy",
    },
    {
        name: "Resend",
        use: "Sends your booking confirmation and call reminder, and sends us a notice when you send a catalog inquiry.",
        policy: "https://resend.com/legal/privacy-policy",
    },
    {
        name: "Stripe",
        use: "Takes payment on its own pages when you buy from the catalog. We receive your name, email and what you bought.",
        policy: "https://stripe.com/privacy",
    },
    {
        name: "Vercel",
        use: "Hosts this website. Like any web host, it handles the requests your browser makes.",
        policy: "https://vercel.com/legal/privacy-policy",
    },
];

export default function PrivacyPage() {
    return (
        <div className="hl-wrap">
            <section className="hl-page-hero" aria-labelledby="pp-title">
                <p className="hl-eyebrow">Legal</p>
                <h1 className="hl-h1" id="pp-title">
                    Privacy policy
                </h1>
                <p className="hl-lead">Last updated November 20, 2026.</p>
            </section>

            <div className="hl-bento">
                <section className="hl-tile hl-span-12" data-tone="warm" aria-labelledby="short-h">
                    <h2 className="hl-h3" id="short-h">
                        The short version
                    </h2>
                    <div className="hl-prose" style={{ marginTop: 12 }}>
                        <p>
                            We collect only what you type into our forms: the discovery-call booking form and the
                            catalog inquiry form, plus anything you buy from the catalog. When you email us, your
                            message stays in our inbox.
                        </p>
                        <p>
                            We use it only for what you sent it for: to answer you, to schedule and remind you about
                            your call, or to follow up on a project. We never sell your data or share it with
                            advertisers, data brokers or ad networks.
                        </p>
                        <p>There are no analytics, tracking pixels, cookies or behavioral monitoring on this website.</p>
                        <p>
                            Ask us to delete your data at any time by writing to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
                            We reply within 2 business days.
                        </p>
                    </div>
                </section>

                <section className="hl-tile hl-span-7" aria-labelledby="collect-h">
                    <h2 className="hl-h3" id="collect-h">
                        What we collect
                    </h2>
                    <dl className="hl-prose" style={{ marginTop: 12 }}>
                        <dt>
                            <b>Discovery call booking</b>
                        </dt>
                        <dd style={{ margin: "4px 0 16px" }}>
                            Name, email address, an optional message, the date and time you choose, and your time zone.
                        </dd>
                        <dt>
                            <b>Catalog inquiry</b>
                        </dt>
                        <dd style={{ margin: "4px 0 16px" }}>
                            Name, email address, company (optional) and your note about the project.
                        </dd>
                        <dt>
                            <b>Catalog purchase</b>
                        </dt>
                        <dd style={{ margin: "4px 0 16px" }}>
                            Stripe collects your payment details on its own pages. We receive your name, email and what
                            you bought.
                        </dd>
                        <dt>
                            <b>Email</b>
                        </dt>
                        <dd style={{ margin: "4px 0 0" }}>Whatever you choose to write to us.</dd>
                    </dl>
                </section>

                <section className="hl-tile hl-span-5" data-tone="ink" aria-labelledby="not-h">
                    <h2 className="hl-h3" id="not-h">
                        What we don’t collect
                    </h2>
                    <p className="hl-body" style={{ marginTop: 12 }}>
                        No cookies, analytics tools, tracking pixels, session recording, heatmaps, device
                        fingerprinting or behavioral monitoring. We don’t access your camera, microphone,
                        location, contacts or any device sensors, and we collect nothing beyond what you send us.
                    </p>
                </section>

                <section className="hl-tile hl-span-12" aria-labelledby="svc-h">
                    <h2 className="hl-h3" id="svc-h">
                        Services that receive your data
                    </h2>
                    <ul className="hl-rows" style={{ marginTop: 8 }}>
                        {services.map((s) => (
                            <li key={s.name} className="hl-row">
                                <span className="hl-row-title">{s.name}</span>
                                <a className="hl-row-price" href={s.policy}>
                                    {s.name}’s privacy policy
                                </a>
                                <span className="hl-row-text">{s.use}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="hl-body hl-measure" style={{ marginTop: 12 }}>
                        We don’t use advertising services, data brokers, social media pixels or analytics
                        providers of any kind. The typefaces on this site are served from this site.
                    </p>
                </section>

                <section className="hl-tile hl-span-6" aria-labelledby="keep-h">
                    <h2 className="hl-h3" id="keep-h">
                        How long we keep it
                    </h2>
                    <div className="hl-prose" style={{ marginTop: 12 }}>
                        <p>
                            Booking and inquiry details stay in our contact records until you ask us to delete them.
                            Calendar events stay in Google Calendar for the call and any follow-up. Stripe keeps
                            payment records under its own policy.
                        </p>
                    </div>
                </section>

                <section className="hl-tile hl-span-6" aria-labelledby="rights-h">
                    <h2 className="hl-h3" id="rights-h">
                        Your rights
                    </h2>
                    <div className="hl-prose" style={{ marginTop: 12 }}>
                        <p>
                            You can ask to see, correct or delete your data at any time by writing to{" "}
                            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. We reply within 2 business days and finish any
                            deletion within 30 days.
                        </p>
                    </div>
                </section>

                <section className="hl-tile hl-span-12" aria-labelledby="changes-h">
                    <h2 className="hl-h3" id="changes-h">
                        Changes to this policy
                    </h2>
                    <div className="hl-prose" style={{ marginTop: 12 }}>
                        <p>
                            If we make a material change to this policy, we’ll email the people it affects before
                            it takes effect, with a short note on what changed. Small fixes, like typos and
                            clarifications, may be made without notice. The date at the top of this page shows the
                            latest revision. Questions go to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
