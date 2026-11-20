import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking/booking-flow";

export const metadata: Metadata = {
    title: "Book a discovery call",
    description:
        "Schedule a free 30-minute discovery call with Hi Low Studio about your workflows, tools and goals.",
};

export default function BookPage() {
    return (
        <div className="hl-wrap">
            <section className="hl-page-hero" aria-labelledby="bk-title">
                <p className="hl-eyebrow">Discovery call</p>
                <h1 className="hl-h1" id="bk-title">
                    Thirty minutes, no pitch.
                </h1>
                <p className="hl-lead">
                    A free call about your workflows and goals. Pick a time that works for you, and we’ll send a
                    Google Meet link.
                </p>
            </section>
            <div className="hl-legacy" style={{ paddingBottom: 88 }}>
                <BookingFlow />
            </div>
        </div>
    );
}
