import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProjectDetail,
  getProjectTasks,
  getProjectNotes,
  getProjectTimeEntries,
  getProjectInvoices,
  getProjectUpdates,
} from "@/lib/studio/queries";
import { ProjectHeader } from "./project-header";
import { PhaseBoard } from "./phase-board";
import { TaskList } from "./task-list";
import { NoteList } from "./note-list";
import { TimeSection } from "./time-section";
import { InvoiceSection } from "./invoice-section";
import { UpdatesSection } from "./updates-section";
import { ShareSection } from "./share-section";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getProjectDetail(id);
  if (!detail) notFound();

  const [tasks, notes, timeEntries, invoices, updates] = await Promise.all([
    getProjectTasks(id),
    getProjectNotes(id),
    getProjectTimeEntries(id),
    getProjectInvoices(id),
    getProjectUpdates(id),
  ]);

  return (
    <div className="space-y-10">
      <Link
        href="/studio/projects"
        className="text-sm text-ink-light hover:text-ink transition-colors inline-block"
      >
        &larr; Projects
      </Link>

      <ProjectHeader project={detail.project} />
      <PhaseBoard projectId={detail.project.id} phases={detail.phases} />
      <TaskList
        projectId={detail.project.id}
        tasks={tasks}
        phases={detail.phases}
      />
      <NoteList projectId={detail.project.id} notes={notes} />
      <TimeSection projectId={detail.project.id} entries={timeEntries} />
      <InvoiceSection projectId={detail.project.id} invoices={invoices} />
      <UpdatesSection projectId={detail.project.id} updates={updates} />
      <ShareSection
        projectId={detail.project.id}
        slug={detail.project.slug}
        enabled={detail.project.public_status_enabled}
      />
    </div>
  );
}
