import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import { sendReminder } from "@/lib/email";

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in23h = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const in1h30 = new Date(now.getTime() + 90 * 60 * 1000);
  const in30m = new Date(now.getTime() + 30 * 60 * 1000);

  let sent24h = 0;
  let sent1h = 0;

  // 24-hour reminders: bookings starting 23-24 hours from now
  const { data: upcoming24h } = await supabase
    .from("bookings")
    .select("id, contact_id, start_time, meet_link")
    .eq("reminder_24h_sent", false)
    .gte("start_time", in23h.toISOString())
    .lte("start_time", in24h.toISOString());

  for (const booking of upcoming24h || []) {
    const { data: contact } = await supabase
      .from("contacts")
      .select("name, email")
      .eq("id", booking.contact_id)
      .single();

    if (!contact) continue;

    try {
      await sendReminder({
        to: contact.email,
        name: contact.name,
        startTime: booking.start_time,
        meetLink: booking.meet_link,
        hoursUntil: 24,
      });

      await supabase
        .from("bookings")
        .update({ reminder_24h_sent: true })
        .eq("id", booking.id);

      await supabase.from("activities").insert({
        contact_id: booking.contact_id,
        type: "email_sent",
        description: "24-hour reminder sent",
      });

      sent24h++;
    } catch (err) {
      console.error(`24h reminder failed for booking ${booking.id}:`, err);
    }
  }

  // 1-hour reminders: bookings starting 30-90 minutes from now
  const { data: upcoming1h } = await supabase
    .from("bookings")
    .select("id, contact_id, start_time, meet_link")
    .eq("reminder_1h_sent", false)
    .gte("start_time", in30m.toISOString())
    .lte("start_time", in1h30.toISOString());

  for (const booking of upcoming1h || []) {
    const { data: contact } = await supabase
      .from("contacts")
      .select("name, email")
      .eq("id", booking.contact_id)
      .single();

    if (!contact) continue;

    try {
      await sendReminder({
        to: contact.email,
        name: contact.name,
        startTime: booking.start_time,
        meetLink: booking.meet_link,
        hoursUntil: 1,
      });

      await supabase
        .from("bookings")
        .update({ reminder_1h_sent: true })
        .eq("id", booking.id);

      await supabase.from("activities").insert({
        contact_id: booking.contact_id,
        type: "email_sent",
        description: "1-hour reminder sent",
      });

      sent1h++;
    } catch (err) {
      console.error(`1h reminder failed for booking ${booking.id}:`, err);
    }
  }

  return NextResponse.json({
    success: true,
    sent: { reminders_24h: sent24h, reminders_1h: sent1h },
  });
}
