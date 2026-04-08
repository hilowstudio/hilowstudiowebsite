import { Metadata } from "next";
import { BookingHero } from "@/components/booking/booking-hero";
import { BookingFlow } from "@/components/booking/booking-flow";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Book a Discovery Call | Hi Low Studio",
    description:
        "Schedule a free 30-minute discovery call with Hi Low Studio. We'll discuss your workflows, pain points, and goals.",
};

export default function BookPage() {
    return (
        <>
            <main>
                <BookingHero />
                <BookingFlow />
            </main>
            <Footer />
        </>
    );
}
