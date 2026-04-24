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
  "google/gemma-4-26b-a4b-it",
  "google/gemma-4-26b-a4b-it:free",
  "google/gemma-4-31b-it",
  "google/gemma-4-31b-it:free",
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

  // Raw fetch test: bypass AI SDK entirely, replicate the exact curl that
  // succeeds from the developer's machine. If this also 404s, the issue is
  // Vercel's outbound IP being filtered by OpenRouter regardless of source.
  // If it succeeds, the AI SDK adds something to the payload that trips the
  // filter.
  let rawTestResult: {
    status: number;
    body: string;
    cfRay: string | null;
  };
  try {
    const rawRes = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "moonshotai/kimi-k2.6",
          messages: [{ role: "user", content: "hello" }],
        }),
      },
    );
    const text = await rawRes.text();
    rawTestResult = {
      status: rawRes.status,
      body: text.slice(0, 500),
      cfRay: rawRes.headers.get("cf-ray"),
    };
  } catch (err) {
    rawTestResult = {
      status: -1,
      body: err instanceof Error ? err.message : String(err),
      cfRay: null,
    };
  }

  return NextResponse.json({
    openrouter_total_models: data.data.length,
    configured_count: HI_LOW_SLUGS.length,
    missing_count: missingCount,
    key_prefix: `${key.slice(0, 16)}...${key.slice(-4)}`,
    vercel_region: process.env.VERCEL_REGION ?? "(unknown)",
    raw_chat_test: rawTestResult,
    models: report,
  });
}
