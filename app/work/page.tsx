import { Metadata } from "next";
import { WorkHero } from "@/components/work/work-hero";
import { ProjectGrid } from "@/components/work/project-grid";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Our Projects | Hi-Low Studio",
    description:
        "Our portfolio of calm tech products. Quill & Compass, Kin & Cairn, Hilow Browser, and Podcatch.",
};

export default function WorkPage() {
    return (
        <>
            <main>
                <WorkHero />
                <ProjectGrid />
            </main>
            <Footer />
        </>
    );
}
