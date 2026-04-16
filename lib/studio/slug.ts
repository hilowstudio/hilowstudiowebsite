import { getSupabase } from "@/lib/supabase";

function kebab(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function uniqueProjectSlug(name: string): Promise<string> {
  const base = kebab(name) || "project";
  const db = getSupabase();

  const { data } = await db
    .from("studio_projects")
    .select("slug")
    .like("slug", `${base}%`);

  const taken = new Set((data ?? []).map((r: { slug: string }) => r.slug));
  if (!taken.has(base)) return base;

  for (let i = 2; i < 1000; i++) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }

  return `${base}-${Date.now()}`;
}
