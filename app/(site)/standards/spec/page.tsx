import type { Metadata } from "next";
import { SpecContent } from "@/components/standards/spec-content";

export const metadata: Metadata = {
    title: "QSF specification",
    description:
        "The complete Quiet Standards Framework specification: 104 auditable criteria across 7 domains for attention-respecting software.",
};

export default function SpecPage() {
    return (
        <div className="hl-legacy">
            <SpecContent />
        </div>
    );
}
