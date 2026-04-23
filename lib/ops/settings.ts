import { getSupabase } from "@/lib/supabase";
import { encryptString, decryptString, tryDecryptString } from "./crypto";

export type SettingScope = "platform" | "workspace" | "client";

export type SettingKey =
  | "anthropic_api_key"
  | "openai_api_key"
  | "gemini_api_key"
  | "xai_api_key"
  | "openrouter_api_key"
  | "deepgram_api_key"
  | "fireflies_api_key"
  | "fathom_api_key";

type SettingRow = {
  id: string;
  scope: SettingScope;
  scope_id: string | null;
  key: string;
  encrypted_value: string;
  updated_at: string;
};

function envFallback(key: SettingKey): string | null {
  switch (key) {
    case "anthropic_api_key":
      return process.env.ANTHROPIC_API_KEY || null;
    case "openai_api_key":
      return process.env.OPENAI_API_KEY || null;
    case "gemini_api_key":
      return (
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        null
      );
    case "xai_api_key":
      return process.env.XAI_API_KEY || null;
    case "openrouter_api_key":
      return process.env.OPENROUTER_API_KEY || null;
    case "deepgram_api_key":
      return process.env.DEEPGRAM_API_KEY || null;
    case "fireflies_api_key":
      return process.env.FIREFLIES_API_KEY || null;
    case "fathom_api_key":
      return process.env.FATHOM_API_KEY || null;
  }
}

/**
 * Resolve a setting using the three-scope fallback:
 *   client -> workspace -> platform -> process.env fallback
 * Returns the first defined value or null.
 */
export async function resolveSetting(
  key: SettingKey,
  scope: { workspaceId?: string | null; clientId?: string | null },
): Promise<{ value: string; source: SettingScope | "env" } | null> {
  const db = getSupabase();

  const scopeFilters: { scope: SettingScope; scope_id: string | null }[] = [];
  if (scope.clientId) {
    scopeFilters.push({ scope: "client", scope_id: scope.clientId });
  }
  if (scope.workspaceId) {
    scopeFilters.push({ scope: "workspace", scope_id: scope.workspaceId });
  }
  scopeFilters.push({ scope: "platform", scope_id: null });

  for (const filter of scopeFilters) {
    let query = db
      .from("ops_settings")
      .select("*")
      .eq("scope", filter.scope)
      .eq("key", key);

    if (filter.scope_id === null) {
      query = query.is("scope_id", null);
    } else {
      query = query.eq("scope_id", filter.scope_id);
    }

    const { data } = await query.maybeSingle();
    if (!data) continue;

    const row = data as SettingRow;
    const decrypted = tryDecryptString(row.encrypted_value);
    if (decrypted) {
      return { value: decrypted, source: row.scope };
    }
  }

  const envValue = envFallback(key);
  if (envValue) return { value: envValue, source: "env" };

  return null;
}

export async function writeSetting(
  key: SettingKey,
  value: string,
  scope: { scope: SettingScope; scopeId: string | null },
): Promise<void> {
  const db = getSupabase();
  const encrypted = encryptString(value);

  const { error } = await db.from("ops_settings").upsert(
    {
      scope: scope.scope,
      scope_id: scope.scopeId,
      key,
      encrypted_value: encrypted,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "scope,scope_id,key" },
  );

  if (error) throw error;
}

export async function deleteSetting(
  key: SettingKey,
  scope: { scope: SettingScope; scopeId: string | null },
): Promise<void> {
  const db = getSupabase();

  let query = db
    .from("ops_settings")
    .delete()
    .eq("scope", scope.scope)
    .eq("key", key);

  if (scope.scopeId === null) {
    query = query.is("scope_id", null);
  } else {
    query = query.eq("scope_id", scope.scopeId);
  }

  const { error } = await query;
  if (error) throw error;
}

export async function listSettingsForScope(
  scope: SettingScope,
  scopeId: string | null,
): Promise<{ key: SettingKey; hasValue: boolean; updatedAt: string }[]> {
  const db = getSupabase();

  let query = db
    .from("ops_settings")
    .select("key, encrypted_value, updated_at")
    .eq("scope", scope);

  if (scopeId === null) {
    query = query.is("scope_id", null);
  } else {
    query = query.eq("scope_id", scopeId);
  }

  const { data } = await query;
  return ((data as { key: string; encrypted_value: string; updated_at: string }[]) ?? []).map(
    (row) => ({
      key: row.key as SettingKey,
      hasValue: Boolean(tryDecryptString(row.encrypted_value)),
      updatedAt: row.updated_at,
    }),
  );
}

export { encryptString, decryptString };
