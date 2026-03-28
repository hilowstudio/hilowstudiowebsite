import { NextRequest, NextResponse } from "next/server";
import { calendarClient, FREEBUSY_CALENDAR_IDS } from "@/lib/google-calendar";
import { bookingConfig } from "@/lib/booking-config";

function getTimezoneOffset(date: Date, timezone: string): string {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(date);
    const offsetPart = parts.find((p) => p.type === "timeZoneName")?.value || "GMT";
    const match = offsetPart.match(/GMT([+-]?)(\d+)?(?::(\d+))?/);
    if (!match) return "+00:00";
    const sign = match[1] || "+";
    const hours = match[2] ? parseInt(match[2]) : 0;
    const minutes = match[3] ? parseInt(match[3]) : 0;
    return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getDateInTimezone(date: Date, timezone: string) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const year = parts.find((p) => p.type === "year")!.value;
    const month = parts.find((p) => p.type === "month")!.value;
    const day = parts.find((p) => p.type === "day")!.value;
    const dayOfWeek = new Date(`${year}-${month}-${day}T12:00:00`).getDay();

    return { year, month, day, dayOfWeek };
}

function generateCandidateSlots(
    rangeStart: Date,
    rangeEnd: Date
): Array<{ start: string; end: string }> {
    const slots: Array<{ start: string; end: string }> = [];
    const { availableDays, startHour, endHour, slotDurationMinutes, bufferMinutes, timezone } =
        bookingConfig;
    const stepMinutes = slotDurationMinutes + bufferMinutes;

    // Iterate day by day from the start of the range
    const current = new Date(rangeStart);
    current.setHours(0, 0, 0, 0);

    while (current <= rangeEnd) {
        const { year, month, day, dayOfWeek } = getDateInTimezone(current, timezone);

        if ((availableDays as readonly number[]).includes(dayOfWeek)) {
            const tzOffset = getTimezoneOffset(current, timezone);

            // Walk through the day in stepMinutes increments
            let minuteOfDay = startHour * 60;
            const endMinuteOfDay = endHour * 60;

            while (minuteOfDay + slotDurationMinutes <= endMinuteOfDay) {
                const slotStartHour = Math.floor(minuteOfDay / 60);
                const slotStartMin = minuteOfDay % 60;
                const slotEndMinute = minuteOfDay + slotDurationMinutes;
                const slotEndHour = Math.floor(slotEndMinute / 60);
                const slotEndMin = slotEndMinute % 60;

                const startStr = `${year}-${month}-${day}T${String(slotStartHour).padStart(2, "0")}:${String(slotStartMin).padStart(2, "0")}:00${tzOffset}`;
                const endStr = `${year}-${month}-${day}T${String(slotEndHour).padStart(2, "0")}:${String(slotEndMin).padStart(2, "0")}:00${tzOffset}`;

                const slotStart = new Date(startStr);
                if (slotStart >= rangeStart && slotStart <= rangeEnd) {
                    slots.push({ start: startStr, end: endStr });
                }

                minuteOfDay += stepMinutes;
            }
        }

        current.setDate(current.getDate() + 1);
    }

    return slots;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return NextResponse.json(
            { error: "Invalid month parameter. Use YYYY-MM format." },
            { status: 400 }
        );
    }

    try {
        const [year, monthNum] = month.split("-").map(Number);
        const now = new Date();

        const monthStart = new Date(year, monthNum - 1, 1);
        const monthEnd = new Date(year, monthNum, 0, 23, 59, 59);

        const minBookingTime = new Date(
            now.getTime() + bookingConfig.minAdvanceHours * 60 * 60 * 1000
        );
        const maxBookingTime = new Date(
            now.getTime() + bookingConfig.maxAdvanceWeeks * 7 * 24 * 60 * 60 * 1000
        );

        const rangeStart = new Date(Math.max(monthStart.getTime(), minBookingTime.getTime()));
        const rangeEnd = new Date(Math.min(monthEnd.getTime(), maxBookingTime.getTime()));

        if (rangeStart >= rangeEnd) {
            return NextResponse.json({
                month,
                timezone: bookingConfig.timezone,
                availableDates: {},
            });
        }

        const candidates = generateCandidateSlots(rangeStart, rangeEnd);

        if (candidates.length === 0) {
            return NextResponse.json({
                month,
                timezone: bookingConfig.timezone,
                availableDates: {},
            });
        }

        const freeBusyResponse = await calendarClient.freebusy.query({
            requestBody: {
                timeMin: rangeStart.toISOString(),
                timeMax: rangeEnd.toISOString(),
                timeZone: bookingConfig.timezone,
                items: FREEBUSY_CALENDAR_IDS.map((id) => ({ id })),
            },
        });

        // Merge busy periods from all calendars
        const busyPeriods = FREEBUSY_CALENDAR_IDS.flatMap(
            (id) => freeBusyResponse.data.calendars?.[id]?.busy ?? []
        );

        const available = candidates.filter((slot) => {
            return !busyPeriods.some((busy) => {
                const busyStart = new Date(busy.start!).getTime();
                const busyEnd = new Date(busy.end!).getTime();
                const slotStart = new Date(slot.start).getTime();
                const slotEnd = new Date(slot.end).getTime();
                return slotStart < busyEnd && slotEnd > busyStart;
            });
        });

        const grouped: Record<string, Array<{ start: string; end: string }>> = {};
        for (const slot of available) {
            const dateKey = slot.start.slice(0, 10);
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(slot);
        }

        return NextResponse.json({
            month,
            timezone: bookingConfig.timezone,
            availableDates: grouped,
        });
    } catch (error) {
        console.error("Availability fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch availability." }, { status: 500 });
    }
}
