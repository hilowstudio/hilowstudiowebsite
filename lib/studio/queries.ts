import { getSupabase } from "@/lib/supabase";

export type Client = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  billing_address: string | null;
  default_rate_cents: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  client_id: string | null;
  name: string;
  slug: string;
  status: "active" | "paused" | "done" | "archived";
  rate_cents: number | null;
  public_status_enabled: boolean;
  last_movement_at: string;
  created_at: string;
  updated_at: string;
};

export type Phase = {
  id: string;
  project_id: string;
  name: string;
  position: number;
  is_current: boolean;
  completed_at: string | null;
};

export type Deliverable = {
  id: string;
  phase_id: string;
  title: string;
  done: boolean;
  position: number;
  completed_at: string | null;
};

export type HomeProject = Project & {
  client_name: string | null;
  current_phase_name: string | null;
  next_deliverable_title: string | null;
};

export async function getClients(): Promise<Client[]> {
  const db = getSupabase();
  const { data, error } = await db
    .from("studio_clients")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data as Client[]) ?? [];
}

export async function getClient(id: string): Promise<Client | null> {
  const db = getSupabase();
  const { data, error } = await db
    .from("studio_clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Client) ?? null;
}

export async function getClientProjects(clientId: string): Promise<Project[]> {
  const db = getSupabase();
  const { data, error } = await db
    .from("studio_projects")
    .select("*")
    .eq("client_id", clientId)
    .order("last_movement_at", { ascending: false });
  if (error) throw error;
  return (data as Project[]) ?? [];
}

export async function getProjects(options?: {
  includeArchived?: boolean;
}): Promise<(Project & { client_name: string | null })[]> {
  const db = getSupabase();
  let query = db
    .from("studio_projects")
    .select("*, studio_clients(name)")
    .order("last_movement_at", { ascending: false });

  if (!options?.includeArchived) {
    query = query.neq("status", "archived");
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => {
    const { studio_clients, ...rest } = row as Project & {
      studio_clients: { name: string } | null;
    };
    return {
      ...(rest as Project),
      client_name: studio_clients?.name ?? null,
    };
  });
}

export async function getHomeProjects(): Promise<HomeProject[]> {
  const db = getSupabase();

  const { data: projects, error } = await db
    .from("studio_projects")
    .select("*, studio_clients(name)")
    .in("status", ["active", "paused"])
    .order("last_movement_at", { ascending: false });

  if (error) throw error;
  if (!projects || projects.length === 0) return [];

  const projectIds = projects.map((p) => p.id);

  const { data: phases } = await db
    .from("studio_phases")
    .select("*")
    .in("project_id", projectIds)
    .order("position", { ascending: true });

  const { data: deliverables } = await db
    .from("studio_deliverables")
    .select("*")
    .in(
      "phase_id",
      (phases ?? []).map((p) => p.id),
    )
    .eq("done", false)
    .order("position", { ascending: true });

  const phasesByProject = new Map<string, Phase[]>();
  for (const phase of (phases as Phase[]) ?? []) {
    const list = phasesByProject.get(phase.project_id) ?? [];
    list.push(phase);
    phasesByProject.set(phase.project_id, list);
  }

  const deliverablesByPhase = new Map<string, Deliverable[]>();
  for (const deliverable of (deliverables as Deliverable[]) ?? []) {
    const list = deliverablesByPhase.get(deliverable.phase_id) ?? [];
    list.push(deliverable);
    deliverablesByPhase.set(deliverable.phase_id, list);
  }

  return projects.map((row) => {
    const { studio_clients, ...rest } = row as Project & {
      studio_clients: { name: string } | null;
    };
    const projectPhases = phasesByProject.get(rest.id) ?? [];
    const current =
      projectPhases.find((p) => p.is_current && !p.completed_at) ??
      projectPhases.find((p) => !p.completed_at) ??
      null;
    const nextDeliverable = current
      ? (deliverablesByPhase.get(current.id) ?? [])[0] ?? null
      : null;

    return {
      ...(rest as Project),
      client_name: studio_clients?.name ?? null,
      current_phase_name: current?.name ?? null,
      next_deliverable_title: nextDeliverable?.title ?? null,
    };
  });
}

export type ProjectDetail = {
  project: Project & { client_name: string | null };
  phases: (Phase & { deliverables: Deliverable[] })[];
};

export async function getProjectDetail(id: string): Promise<ProjectDetail | null> {
  const db = getSupabase();

  const { data: project, error } = await db
    .from("studio_projects")
    .select("*, studio_clients(name)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!project) return null;

  const { studio_clients, ...projectRest } = project as Project & {
    studio_clients: { name: string } | null;
  };

  const { data: phases } = await db
    .from("studio_phases")
    .select("*")
    .eq("project_id", id)
    .order("position", { ascending: true });

  const { data: deliverables } = await db
    .from("studio_deliverables")
    .select("*")
    .in(
      "phase_id",
      (phases ?? []).map((p) => p.id),
    )
    .order("position", { ascending: true });

  const deliverablesByPhase = new Map<string, Deliverable[]>();
  for (const deliverable of (deliverables as Deliverable[]) ?? []) {
    const list = deliverablesByPhase.get(deliverable.phase_id) ?? [];
    list.push(deliverable);
    deliverablesByPhase.set(deliverable.phase_id, list);
  }

  return {
    project: {
      ...(projectRest as Project),
      client_name: studio_clients?.name ?? null,
    },
    phases: ((phases as Phase[]) ?? []).map((phase) => ({
      ...phase,
      deliverables: deliverablesByPhase.get(phase.id) ?? [],
    })),
  };
}
