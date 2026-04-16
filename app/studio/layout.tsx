import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/admin-auth";
import { StudioShell } from "@/components/studio/studio-shell";
import { getRunningTimer } from "@/lib/studio/queries";

export const metadata = {
  title: "Studio | Hi Low Studio",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();

  if (!authed) {
    redirect("/login?next=/studio");
  }

  const timer = await getRunningTimer();
  const timerProp = timer
    ? {
        id: timer.id,
        project_id: timer.project_id,
        project_name: timer.project_name,
        started_at: timer.started_at,
      }
    : null;

  return <StudioShell runningTimer={timerProp}>{children}</StudioShell>;
}
