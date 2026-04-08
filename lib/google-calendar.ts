import { google } from "googleapis";

function getCalendarClient() {
    const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/calendar"],
        subject: process.env.GOOGLE_IMPERSONATE_EMAIL,
    });

    return google.calendar({ version: "v3", auth });
}

export const calendarClient = getCalendarClient();

// Primary calendar. Booking events are created here.
export const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID!;

// All calendars to check for conflicts (comma-separated).
// Falls back to just the primary calendar if not set.
export const FREEBUSY_CALENDAR_IDS: string[] = process.env.GOOGLE_CHECK_CALENDAR_IDS
    ? process.env.GOOGLE_CHECK_CALENDAR_IDS.split(",").map((id) => id.trim())
    : [CALENDAR_ID];
