import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Missing RESEND_API_KEY env var");
  _resend = new Resend(key);
  return _resend;
}

const FROM = "Hi-Low Studio <hello@hilowstudio.dev>";

export async function sendBookingConfirmation({
  to,
  name,
  startTime,
  meetLink,
}: {
  to: string;
  name: string;
  startTime: string;
  meetLink: string | null;
}) {
  const date = new Date(startTime);
  const formatted = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: "America/New_York",
  });

  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Your discovery call is booked",
    html: `
      <div style="font-family: Georgia, serif; color: #333; max-width: 560px; margin: 0 auto;">
        <h2 style="font-weight: 400; margin-bottom: 4px;">Hi ${name},</h2>
        <p>Your discovery call with Hi-Low Studio is confirmed for:</p>
        <p style="font-size: 18px; font-weight: 500; margin: 20px 0;">${formatted}</p>
        ${meetLink ? `<p><a href="${meetLink}" style="color: #7a5c3e;">Join via Google Meet</a></p>` : ""}
        <hr style="border: none; border-top: 1px solid #e5e0d8; margin: 24px 0;" />
        <h3 style="font-weight: 400; font-size: 16px;">Before we meet</h3>
        <p>To make the most of our time, it would help to know a bit more about you. Could you reply to this email with brief answers to these questions?</p>
        <ol style="line-height: 1.8;">
          <li>What does your business do, and how big is your team?</li>
          <li>What's the most time-consuming manual process in your operations right now?</li>
          <li>Have you tried any automation or AI tools before? What worked or didn't?</li>
          <li>What would a successful engagement look like for you?</li>
        </ol>
        <p style="color: #888; font-size: 14px; margin-top: 24px;">
          No pressure if you'd rather just chat — these just help me come prepared.
        </p>
        <p style="margin-top: 32px;">Looking forward to it,<br/>Adam Vega<br/>Hi-Low Studio</p>
      </div>
    `,
  });
}

export async function sendCatalogInquiryNotification({
  to,
  catalogName,
  catalogSlug,
  contactId,
  name,
  email,
  company,
  message,
}: {
  to: string;
  catalogName: string;
  catalogSlug: string;
  contactId: string;
  name: string;
  email: string;
  company?: string | null;
  message: string;
}) {
  const adminUrl = `https://hilowstudio.dev/admin/contacts/${contactId}`;

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Catalog inquiry: ${catalogName}`,
    html: `
      <div style="font-family: Georgia, serif; color: #333; max-width: 560px; margin: 0 auto;">
        <p style="color: #888; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
          New catalog inquiry
        </p>
        <h2 style="font-weight: 400; margin-top: 0; margin-bottom: 24px;">${catalogName}</h2>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #888; width: 100px; vertical-align: top;">Name</td>
            <td style="padding: 8px 0;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; vertical-align: top;">Email</td>
            <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #7a5c3e;">${email}</a></td>
          </tr>
          ${
            company
              ? `<tr>
                  <td style="padding: 8px 0; color: #888; vertical-align: top;">Company</td>
                  <td style="padding: 8px 0;">${company}</td>
                </tr>`
              : ""
          }
          <tr>
            <td style="padding: 8px 0; color: #888; vertical-align: top;">Catalog item</td>
            <td style="padding: 8px 0;">${catalogName} <span style="color: #888;">(${catalogSlug})</span></td>
          </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #e5e0d8; margin: 24px 0;" />

        <p style="color: #888; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
          Message
        </p>
        <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>

        <hr style="border: none; border-top: 1px solid #e5e0d8; margin: 24px 0;" />

        <p style="margin: 0;">
          <a href="${adminUrl}" style="color: #7a5c3e;">Open contact in admin →</a>
        </p>
      </div>
    `,
  });
}

export async function sendReminder({
  to,
  name,
  startTime,
  meetLink,
  hoursUntil,
}: {
  to: string;
  name: string;
  startTime: string;
  meetLink: string | null;
  hoursUntil: 24 | 1;
}) {
  const date = new Date(startTime);
  const formatted = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: "America/New_York",
  });

  const timeLabel = hoursUntil === 24 ? "tomorrow" : "in about an hour";

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Reminder: your call is ${timeLabel}`,
    html: `
      <div style="font-family: Georgia, serif; color: #333; max-width: 560px; margin: 0 auto;">
        <p>Hi ${name},</p>
        <p>Just a reminder — your discovery call with Hi-Low Studio is ${timeLabel}:</p>
        <p style="font-size: 18px; font-weight: 500; margin: 20px 0;">${formatted}</p>
        ${meetLink ? `<p><a href="${meetLink}" style="color: #7a5c3e;">Join via Google Meet</a></p>` : ""}
        <p style="margin-top: 24px;">See you then,<br/>Adam</p>
      </div>
    `,
  });
}
