import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/ops/auth";
import { NewWorkspaceForm } from "./new-workspace-form";

export const dynamic = "force-dynamic";

export default async function NewWorkspacePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/app/login");
  if (!user.isPlatformAdmin) redirect("/app");

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-paper-muted">
        <div className="container-calm py-4 flex items-baseline justify-between">
          <span className="font-serif text-lg text-ink">Hi Low Ops</span>
          <a
            href="/app"
            className="text-sm text-ink-light hover:text-ink transition-colors"
          >
            Back
          </a>
        </div>
      </header>

      <main className="container-calm py-12 max-w-lg">
        <NewWorkspaceForm />
      </main>
    </div>
  );
}
