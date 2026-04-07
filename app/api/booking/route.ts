import { NextRequest, NextResponse } from "next/server";
import { calendarClient, CALENDAR_ID, FREEBUSY_CALENDAR_IDS } from "@/lib/google-calendar";
import { bookingConfig } from "@/lib/booking-config";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabase";
import { sendBookingConfirmation } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { start, end, name, email, message, timezone } = body;

        if (!start || !end || !name || !email) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
        }

        // Double-booking prevention: re-check freebusy before creating event
        const freeBusy = await calendarClient.freebusy.query({
            requestBody: {
                timeMin: start,
                timeMax: end,
                timeZone: bookingConfig.timezone,
                items: FREEBUSY_CALENDAR_IDS.map((id) => ({ id })),
            },
        });

        const busySlots = FREEBUSY_CALENDAR_IDS.flatMap(
            (id) => freeBusy.data.calendars?.[id]?.busy ?? []
        );
        if (busySlots.length > 0) {
            return NextResponse.json(
                { error: "This time slot is no longer available. Please choose another." },
                { status: 409 }
            );
        }

        const description = [
            bookingConfig.meetingDescription,
            "",
            "--- Booker Details ---",
            `Name: ${name}`,
            `Email: ${email}`,
            message ? `Notes: ${message}` : "",
        ]
            .filter(Boolean)
            .join("\n");

        const event = await calendarClient.events.insert({
            calendarId: CALENDAR_ID,
            conferenceDataVersion: 1,
            sendUpdates: "all",
            requestBody: {
                summary: bookingConfig.meetingTitle,
                description,
                start: {
                    dateTime: start,
                    timeZone: timezone || bookingConfig.timezone,
                },
                end: {
                    dateTime: end,
                    timeZone: timezone || bookingConfig.timezone,
                },
                attendees: [{ email, displayName: name }],
                conferenceData: {
                    createRequest: {
                        requestId: randomUUID(),
                        conferenceSolutionKey: { type: "hangoutsMeet" },
                    },
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: "email", minutes: 60 },
                        { method: "popup", minutes: 15 },
                    ],
                },
            },
        });

        const meetLink = event.data.conferenceData?.entryPoints?.find(
            (ep) => ep.entryPointType === "video"
        )?.uri;

        // --- Lead capture: write to Supabase (non-blocking) ---
        captureLeadAsync({ name, email, message, start, end, meetLink, eventId: event.data.id });

        return NextResponse.json({
            success: true,
            booking: {
                eventId: event.data.id,
                start: event.data.start?.dateTime,
                end: event.data.end?.dateTime,
                meetLink: meetLink || null,
                summary: event.data.summary,
            },
        });
    } catch (error) {
        console.error("Booking creation error:", error);
        return NextResponse.json({ error: "Failed to create booking." }, { status: 500 });
    }
}

/** Fire-and-forget lead capture — doesn't block the booking response */
function captureLeadAsync(params: {
    name: string;
    email: string;
    message?: string;
    start: string;
    end: string;
    meetLink: string | null | undefined;
    eventId: string | null | undefined;
}) {
    captureLead(params).catch((err) =>
        console.error("Lead capture failed (non-blocking):", err)
    );
}

async function captureLead({
    name,
    email,
    message,
    start,
    end,
    meetLink,
    eventId,
}: {
    name: string;
    email: string;
    message?: string;
    start: string;
    end: string;
    meetLink: string | null | undefined;
    eventId: string | null | undefined;
}) {
    // Upsert contact
    const { data: contact, error: contactErr } = await supabase
        .from("contacts")
        .upsert(
            { name, email, source: "booking", stage: "call_booked" },
            { onConflict: "email" }
        )
        .select("id")
        .single();

    if (contactErr || !contact) {
        console.error("Contact upsert failed:", contactErr);
        return;
    }

    // Insert booking record
    const { error: bookingErr } = await supabase.from("bookings").insert({
        contact_id: contact.id,
        google_event_id: eventId || null,
        meet_link: meetLink || null,
        start_time: start,
        end_time: end,
        message: message || null,
    });

    if (bookingErr) {
        console.error("Booking record insert failed:", bookingErr);
    }

    // Log activity
    await supabase.from("activities").insert({
        contact_id: contact.id,
        type: "booking_created",
        description: `Discovery call booked for ${new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`,
    });

    // Send confirmation + questionnaire email
    try {
        await sendBookingConfirmation({
            to: email,
            name,
            startTime: start,
            meetLink: meetLink || null,
        });

        await supabase
            .from("bookings")
            .update({ questionnaire_sent: true })
            .eq("contact_id", contact.id)
            .eq("google_event_id", eventId || "");

        await supabase.from("activities").insert({
            contact_id: contact.id,
            type: "email_sent",
            description: "Booking confirmation + pre-call questionnaire sent",
        });
    } catch (emailErr) {
        console.error("Confirmation email failed:", emailErr);
    }
}
