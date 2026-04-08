export const bookingConfig = {
    // Timezone for the consultant's working hours
    timezone: "America/New_York",

    // Which days are available (0 = Sunday, 1 = Monday, ... 6 = Saturday)
    availableDays: [1, 2, 3, 4, 5], // Monday through Friday

    // Working hours in 24h format (in the consultant's timezone)
    startHour: 9, // 9:00 AM
    endHour: 17, // 5:00 PM (last slot starts at 4:30 for a 30-min meeting)

    // Slot configuration
    slotDurationMinutes: 30,
    bufferMinutes: 15, // gap between meetings

    // Booking window
    minAdvanceHours: 24, // must book at least 24 hours out
    maxAdvanceWeeks: 4, // can book up to 4 weeks out

    // Meeting details
    meetingTitle: "Discovery Call with Hi Low Studio",
    meetingDescription: `30-minute discovery call with Hi Low Studio.\n\nWe'll discuss your workflows, pain points, and goals. No pitch. No pressure.\n\nGoogle Meet link is included below.`,
} as const;

export type BookingConfig = typeof bookingConfig;
