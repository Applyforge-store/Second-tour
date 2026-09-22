import nodemailer from "nodemailer";
import { env } from "@/lib/env";
import { sql } from "@/lib/db";

function transporter() {
  const config = env();
  if (!config.GMAIL_USER || !config.GMAIL_APP_PASSWORD) {
    throw new Error("L’envoi d’e-mails n’est pas configuré.");
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: config.GMAIL_USER, pass: config.GMAIL_APP_PASSWORD.replace(/\s/g, "") },
  });
}

export async function sendReminder(reminderId: string, garageId?: string) {
  const rows = await sql<{
    id: string;
    garage_id: string;
    status: string;
    subject: string;
    body: string;
    email: string;
    first_name: string;
    garage_name: string;
    contact_email: string;
  }[]>`
    SELECT r.id, r.garage_id, r.status, r.subject, r.body,
      c.email, c.first_name, g.name AS garage_name, g.contact_email
    FROM reminders r
    JOIN clients c ON c.id = r.client_id
    JOIN garages g ON g.id = r.garage_id
    WHERE r.id = ${reminderId}
      AND (${garageId ?? null}::uuid IS NULL OR r.garage_id = ${garageId ?? null}::uuid)
      AND c.active = true AND c.email_consent = true AND g.active = true
    LIMIT 1
  `;
  const reminder = rows[0];
  if (!reminder) throw new Error("Rappel introuvable ou client sans consentement.");
  if (reminder.status === "SENT") return { alreadySent: true };

  try {
    const config = env();
    await transporter().sendMail({
      from: `\"${config.FROM_NAME}\" <${config.GMAIL_USER}>`,
      replyTo: reminder.contact_email,
      to: reminder.email,
      subject: reminder.subject,
      text: reminder.body,
    });
    await sql`UPDATE reminders SET status = 'SENT', sent_at = now(), error_message = NULL, updated_at = now() WHERE id = ${reminder.id}`;
    return { alreadySent: false };
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Erreur d’envoi inconnue";
    await sql`UPDATE reminders SET status = 'FAILED', error_message = ${message}, updated_at = now() WHERE id = ${reminder.id}`;
    throw error;
  }
}

export async function sendAllDueReminders(now = new Date()) {
  const rows = await sql<{ id: string }[]>`
    SELECT id FROM reminders
    WHERE status IN ('PENDING', 'FAILED') AND due_at <= ${now.toISOString()}::timestamptz
    ORDER BY due_at ASC LIMIT 200
  `;
  let sent = 0;
  let failed = 0;
  for (const row of rows) {
    try {
      await sendReminder(row.id);
      sent += 1;
    } catch {
      failed += 1;
    }
  }
  return { sent, failed };
}
