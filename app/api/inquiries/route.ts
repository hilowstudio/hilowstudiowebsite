import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendCatalogInquiryNotification } from "@/lib/email";
import { getCatalogItem } from "@/lib/catalog";

// In-memory rate limit: 5 inquiries / minute / IP
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 1000;
const ipHits = new Map<string, number[]>();

function rateLimit(ip: string): boolean {
    const now = Date.now();
    const recent = (ipHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= RATE_LIMIT) {
        ipHits.set(ip, recent);
        return false;
    }
    recent.push(now);
    ipHits.set(ip, recent);
    return true;
}

const NOTIFY_TO = "hello@hilowstudio.dev";

export async function POST(request: NextRequest) {
    try {
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            "unknown";

        if (!rateLimit(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Please try again in a minute." },
                { status: 429 },
            );
        }

        const body = await request.json();
        const { name, email, company, message, catalogSlug, catalogName } =
            body as {
                name?: string;
                email?: string;
                company?: string;
                message?: string;
                catalogSlug?: string;
                catalogName?: string;
            };

        if (!name || !email || !message || !catalogSlug || !catalogName) {
            return NextResponse.json(
                { error: "Missing required fields." },
                { status: 400 },
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email address." },
                { status: 400 },
            );
        }

        // Verify the slug matches a real catalog item
        const item = getCatalogItem(catalogSlug);
        if (!item) {
            return NextResponse.json(
                { error: "Unknown catalog item." },
                { status: 400 },
            );
        }

        // Upsert contact
        const { data: contact, error: contactErr } = await supabase
            .from("contacts")
            .upsert(
                {
                    name,
                    email,
                    company: company || null,
                    source: `catalog:${catalogSlug}`,
                    stage: "lead",
                    notes: `[catalog:${catalogSlug}] ${message}`,
                },
                { onConflict: "email" },
            )
            .select("id")
            .single();

        if (contactErr || !contact) {
            console.error("Contact upsert failed:", contactErr);
            return NextResponse.json(
                {
                    error:
                        "Something went wrong. Please email hello@hilowstudio.dev.",
                },
                { status: 500 },
            );
        }

        // Log activity
        await supabase.from("activities").insert({
            contact_id: contact.id,
            type: "note_added",
            description: `Catalog inquiry: ${catalogName}`,
            metadata: { source: "catalog", slug: catalogSlug },
        });

        // Notify Adam (fire-and-forget, non-blocking)
        sendCatalogInquiryNotification({
            to: NOTIFY_TO,
            catalogName,
            catalogSlug,
            contactId: contact.id,
            name,
            email,
            company: company || null,
            message,
        }).catch((err) =>
            console.error("Catalog inquiry notification failed:", err),
        );

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Inquiry handler error:", error);
        return NextResponse.json(
            {
                error:
                    "Something went wrong. Please email hello@hilowstudio.dev.",
            },
            { status: 500 },
        );
    }
}
