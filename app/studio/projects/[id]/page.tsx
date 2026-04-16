import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectDetail } from "@/lib/studio/queries";
import { ProjectHeader } from "./project-header";
import { PhaseBoard } from "./phase-board";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getProjectDetail(id);
  if (!detail) notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/studio/projects"
        className="text-sm text-ink-light hover:text-ink transition-colors inline-block"
      >
        &larr; Projects
      </Link>

      <ProjectHeader project={detail.project} />
      <PhaseBoard projectId={detail.project.id} phases={detail.phases} />
    </div>
  );
}
