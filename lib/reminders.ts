import { sql } from "@/lib/db";

export type ReminderTemplateInput = {
  firstName: string;
  vehicle: string;
  garage: string;
  date: string;
};

export function renderTemplate(template: string, input: ReminderTemplateInput) {
  const values: Record<string, string> = {
    prenom: input.firstName,
    vehicule: input.vehicle,
    garage: input.garage,
    date: input.date,
  };
  return template.replace(/\{\{(prenom|vehicule|garage|date)\}\}/g, (_, key: string) => values[key] ?? "");
}

export async function generateDueReminders(now = new Date()) {
  const clients = await sql<{
    id: string;
    garage_id: string;
    first_name: string;
    email: string;
    vehicle: string;
    next_service_date: string;
    garage_name: string;
    reminder_days_before: number;
    email_subject: string;
    email_template: string;
  }[]>`
    SELECT c.id, c.garage_id, c.first_name, c.email, c.vehicle,
      c.next_service_date::text, g.name AS garage_name, g.reminder_days_before,
      g.email_subject, g.email_template
    FROM clients c
    JOIN garages g ON g.id = c.garage_id
    WHERE c.active = true AND c.email_consent = true AND g.active = true
      AND c.next_service_date <= (${now.toISOString()}::timestamptz + (g.reminder_days_before || ' days')::interval)::date
  `;

  let created = 0;
  for (const client of clients) {
    const dueAt = new Date(`${client.next_service_date}T09:00:00.000Z`);
    dueAt.setUTCDate(dueAt.getUTCDate() - client.reminder_days_before);
    const body = renderTemplate(client.email_template, {
      firstName: client.first_name,
      vehicle: client.vehicle,
      garage: client.garage_name,
      date: new Intl.DateTimeFormat("fr-BE", { dateStyle: "long", timeZone: "Europe/Brussels" }).format(new Date(client.next_service_date)),
    });
    const result = await sql`
      INSERT INTO reminders (garage_id, client_id, due_at, subject, body)
      VALUES (${client.garage_id}, ${client.id}, ${dueAt.toISOString()}, ${client.email_subject}, ${body})
      ON CONFLICT (garage_id, client_id, due_at) DO NOTHING
      RETURNING id
    `;
    created += result.count;
  }
  return created;
}
