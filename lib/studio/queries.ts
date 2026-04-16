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

export type Task = {
  id: string;
  project_id: string;
  phase_id: string | null;
  title: string;
  done: boolean;
  next_up: boolean;
  created_at: string;
  completed_at: string | null;
};

export type Note = {
  id: string;
  project_id: string;
  body: string;
  created_at: string;
};

export type InboxItem = {
  id: string;
  body: string;
  processed: boolean;
  created_at: string;
};

export type NextUpTask = Task & {
  project_name: string;
};

export type TimeEntry = {
  id: string;
  project_id: string;
  started_at: string;
  ended_at: string | null;
  description: string | null;
  rate_cents: number | null;
  invoiced_id: string | null;
};

export type RunningTimer = TimeEntry & {
  project_name: string;
};

export type Invoice = {
  id: string;
  project_id: string;
  number: string | null;
  amount_cents: number;
  state: "draft" | "sent" | "paid" | "overdue";
  sent_at: string | null;
  due_at: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
};

export type ClientUpdate = {
  id: string;
  project_id: string;
  draft_body: string;
  final_body: string | null;
  status: "draft" | "approved" | "sent";
  generated_at: string;
  sent_at: string | null;
  source: "manual" | "cron";
};

export type ClientUpdateWithProject = ClientUpdate & {
  project_name: string;
};

export type PublicProject = {
  name: string;
  client_display: string | null;
  current_phase_name: string | null;
  completed_deliverables: string[];
  remaining_deliverables: string[];
  next_phase_name: string | null;
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
    const { studio_clients, ...rest } = row as unknown as Project & {
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
    const { studio_clients, ...rest } = row as unknown as Project & {
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

  const { studio_clients, ...projectRest } = project as unknown as Project & {
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

export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const db = getSupabase();
  const { data, error } = await db
    .from("studio_tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("done", { ascending: true })
    .order("next_up", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Task[]) ?? [];
}

export async function getProjectNotes(projectId: string): Promise<Note[]> {
  const db = getSupabase();
  const { data, error } = await db
    .from("studio_notes")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Note[]) ?? [];
}

export async function getUnprocessedInbox(): Promise<InboxItem[]> {
  const db = getSupabase();
  const { data, error } = await db
    .from("studio_inbox_items")
    .select("*")
    .eq("processed", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as InboxItem[]) ?? [];
}

export async function getNextUpTasks(): Promise<NextUpTask[]> {
  const db = getSupabase();
  const { data, error } = await db
    .from("studio_tasks")
    .select("*, studio_projects(name)")
    .eq("next_up", true)
    .eq("done", false)
    .order("created_at", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const { studio_projects, ...rest } = row as unknown as Task & {
      studio_projects: { name: string } | null;
    };
    return {
      ...(rest as Task),
      project_name: studio_projects?.name ?? "",
    };
  });
}

export async function getProjectTimeEntries(
  projectId: string,
): Promise<TimeEntry[]> {
  const db = getSupabase();
  const { data, error } = await db
    .from("studio_time_entries")
    .select("*")
    .eq("project_id", projectId)
    .order("started_at", { ascending: false });
  if (error) throw error;
  return (data as TimeEntry[]) ?? [];
}

export async function getRunningTimer(): Promise<RunningTimer | null> {
  const db = getSupabase();
  const { data, error } = await db
    .from("studio_time_entries")
    .select("*, studio_projects(name)")
    .is("ended_at", null)
    .limit(1);
  if (error) throw error;
  if (!data || data.length === 0) return null;
  const { studio_projects, ...rest } = data[0] as unknown as TimeEntry & {
    studio_projects: { name: string } | null;
  };
  return {
    ...(rest as TimeEntry),
    project_name: studio_projects?.name ?? "",
  };
}

export async function getProjectInvoices(
  projectId: string,
): Promise<Invoice[]> {
  const db = getSupabase();
  const { data, error } = await db
    .from("studio_invoices")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Invoice[]) ?? [];
}

export async function getProjectUpdates(
  projectId: string,
): Promise<ClientUpdate[]> {
  const db = getSupabase();
  const { data, error } = await db
    .from("studio_client_updates")
    .select("*")
    .eq("project_id", projectId)
    .order("generated_at", { ascending: false });
  if (error) throw error;
  return (data as ClientUpdate[]) ?? [];
}

export async function getAllUpdates(): Promise<ClientUpdateWithProject[]> {
  const db = getSupabase();
  const { data, error } = await db
    .from("studio_client_updates")
    .select("*, studio_projects(name)")
    .order("generated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const { studio_projects, ...rest } = row as unknown as ClientUpdate & {
      studio_projects: { name: string } | null;
    };
    return {
      ...(rest as ClientUpdate),
      project_name: studio_projects?.name ?? "",
    };
  });
}

export async function getUpdate(
  id: string,
): Promise<ClientUpdateWithProject | null> {
  const db = getSupabase();
  const { data, error } = await db
    .from("studio_client_updates")
    .select("*, studio_projects(name)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { studio_projects, ...rest } = data as unknown as ClientUpdate & {
    studio_projects: { name: string } | null;
  };
  return {
    ...(rest as ClientUpdate),
    project_name: studio_projects?.name ?? "",
  };
}

export async function getActiveProjectIds(): Promise<string[]> {
  const db = getSupabase();
  const { data, error } = await db
    .from("studio_projects")
    .select("id")
    .eq("status", "active");
  if (error) throw error;
  return ((data as { id: string }[]) ?? []).map((p) => p.id);
}

export async function getPublicProject(
  slug: string,
): Promise<PublicProject | null> {
  const db = getSupabase();

  const { data: project, error } = await db
    .from("studio_projects")
    .select("id, name, public_status_enabled, studio_clients(name, company)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!project) return null;
  const row = project as unknown as {
    id: string;
    name: string;
    public_status_enabled: boolean;
    studio_clients: { name: string; company: string | null } | null;
  };
  if (!row.public_status_enabled) return null;

  const { data: phases } = await db
    .from("studio_phases")
    .select("*")
    .eq("project_id", row.id)
    .order("position", { ascending: true });

  const phaseList = (phases as Phase[]) ?? [];
  const current =
    phaseList.find((p) => p.is_current && !p.completed_at) ??
    phaseList.find((p) => !p.completed_at) ??
    null;
  const nextPhase = current
    ? phaseList.find(
        (p) => p.position > current.position && !p.completed_at,
      ) ?? null
    : null;

  let completed: string[] = [];
  let remaining: string[] = [];

  if (current) {
    const { data: deliverables } = await db
      .from("studio_deliverables")
      .select("*")
      .eq("phase_id", current.id)
      .order("position", { ascending: true });

    const list = (deliverables as Deliverable[]) ?? [];
    completed = list.filter((d) => d.done).map((d) => d.title);
    remaining = list.filter((d) => !d.done).map((d) => d.title);
  }

  return {
    name: row.name,
    client_display:
      row.studio_clients?.company || row.studio_clients?.name || null,
    current_phase_name: current?.name ?? null,
    completed_deliverables: completed,
    remaining_deliverables: remaining,
    next_phase_name: nextPhase?.name ?? null,
  };
}
