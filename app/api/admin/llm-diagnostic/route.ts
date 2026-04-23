import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";

/**
 * Admin-only diagnostic: compares hi-low's configured OpenRouter model slugs
 * against the live model catalog that OpenRouter exposes for the current
 * OPENROUTER_API_KEY. Surfaces slug mismatches that would cause
 * "No endpoints available matching your guardrail restrictions" errors.
 *
 * GET /api/admin/llm-diagnostic
 */

const HI_LOW_SLUGS = [
  "qwen/qwen3.6-plus",
  "z-ai/glm-5.1",
  "moonshotai/kimi-k2.6",
  "minimax/minimax-m2.7",
  "google/gemma-4-26b-a4b",
  "google/gemma-4-26b-a4b:free",
  "google/gemma-4-31b",
  "google/gemma-4-31b:free",
];

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY not set on platform" },
      { status: 500 },
    );
  }

  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { Authorization: `Bearer ${key}` },
  });

  if (!res.ok) {
    return NextResponse.json(
      {
        error: `OpenRouter /models returned ${res.status}`,
        body: await res.text(),
      },
      { status: 502 },
    );
  }

  const data = (await res.json()) as {
    data: { id: string; name?: string; context_length?: number }[];
  };
  const liveSlugs = new Set(data.data.map((m) => m.id));

  const vendorMatch = (slug: string) => {
    const vendor = slug.split("/")[0];
    return data.data
      .filter((m) => m.id.startsWith(`${vendor}/`))
      .map((m) => ({ id: m.id, name: m.name ?? null }));
  };

  const report = HI_LOW_SLUGS.map((configured) => ({
    configured,
    found: liveSlugs.has(configured),
    same_vendor_matches: liveSlugs.has(configured)
      ? undefined
      : vendorMatch(configured)
          .filter((m) => {
            const lastSegment = configured.split("/")[1];
            return m.id
              .toLowerCase()
              .includes(lastSegment.split("-")[0].toLowerCase());
          })
          .slice(0, 10),
  }));

  const missingCount = report.filter((r) => !r.found).length;

  return NextResponse.json({
    openrouter_total_models: data.data.length,
    configured_count: HI_LOW_SLUGS.length,
    missing_count: missingCount,
    models: report,
  });
}
