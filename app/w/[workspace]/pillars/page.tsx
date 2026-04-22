import { redirect } from "next/navigation";

export default async function RedirectPillars({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace } = await params;
  redirect(`/w/${workspace}/content/voice`);
}
