import Link from "next/link";
import { notFound } from "next/navigation";
import { getUpdate } from "@/lib/studio/queries";
import { UpdateEditor } from "./update-editor";

export const dynamic = "force-dynamic";

export default async function UpdateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const update = await getUpdate(id);
  if (!update) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/studio/updates"
        className="text-sm text-ink-light hover:text-ink transition-colors inline-block"
      >
        &larr; Updates
      </Link>

      <header className="space-y-1">
        <p className="text-xs text-ink-light">
          {new Date(update.generated_at).toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
          {update.source === "cron" && " · auto-drafted"}
        </p>
        <h1 className="font-serif text-2xl text-ink">
          <Link
            href={`/studio/projects/${update.project_id}`}
            className="hover:text-clay transition-colors"
          >
            {update.project_name}
          </Link>
        </h1>
      </header>

      <UpdateEditor update={update} />
    </div>
  );
}
