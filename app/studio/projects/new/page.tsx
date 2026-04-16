import { getClients } from "@/lib/studio/queries";
import { NewProjectForm } from "./new-project-form";

export const dynamic = "force-dynamic";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client } = await searchParams;
  const clients = await getClients();

  return <NewProjectForm clients={clients} preselectedClientId={client ?? null} />;
}
