import { NextRequest, NextResponse } from "next/server";
import { calendarClient, CALENDAR_ID, FREEBUSY_CALENDAR_IDS } from "@/lib/google-calendar";
import { bookingConfig } from "@/lib/booking-config";
import { randomUUID } from "crypto";

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
