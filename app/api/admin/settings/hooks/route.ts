import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

const SETTINGS_KEY = "enabled_hooks";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();

  return NextResponse.json({
    enabledHooks: (data?.value as string[]) || [],
  });
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { enabledHooks } = (await request.json()) as {
    enabledHooks: string[];
  };

  if (!Array.isArray(enabledHooks)) {
    return NextResponse.json(
      { error: "enabledHooks must be an array" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("app_settings").upsert(
    {
      key: SETTINGS_KEY,
      value: enabledHooks,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ enabledHooks });
}
