"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireGarageAdmin } from "@/lib/auth";
import { parseCsv } from "@/lib/csv";
import { sql } from "@/lib/db";
import { clientSchema } from "@/lib/validation";

export async function importClientsAction(formData: FormData) {
  const session = await requireGarageAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > 2_000_000) redirect("/dashboard/clients/import?error=Choisissez%20un%20fichier%20CSV%20de%20moins%20de%202%20Mo");
  const rows = parseCsv(await file.text());
  if (!rows.length || rows.length > 2000) redirect("/dashboard/clients/import?error=Le%20fichier%20doit%20contenir%20entre%201%20et%202000%20clients");
  const valid: ReturnType<typeof clientSchema.parse>[] = [];
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const parsed = clientSchema.safeParse({
      firstName: row.prenom, lastName: row.nom ?? "", email: row.email, phone: row.telephone ?? "",
      vehicle: row.vehicule, plate: row.immatriculation ?? "", lastServiceDate: row.dernier_entretien ?? "",
      nextServiceDate: row.prochain_entretien, emailConsent: ["oui", "yes", "true", "1"].includes((row.consentement_email ?? "").toLowerCase()),
    });
    if (!parsed.success) redirect(`/dashboard/clients/import?error=${encodeURIComponent(`Ligne ${index + 2} invalide`)}`);
    valid.push(parsed.data);
  }
  try {
    await sql.begin(async (transaction) => {
      for (const d of valid) {
        await transaction`
          INSERT INTO clients (garage_id, first_name, last_name, email, phone, vehicle, plate, last_service_date, next_service_date, email_consent, consent_recorded_at)
          VALUES (${session.garageId}, ${d.firstName}, ${d.lastName}, ${d.email.toLowerCase()}, ${d.phone}, ${d.vehicle}, ${d.plate}, ${d.lastServiceDate || null}, ${d.nextServiceDate}, ${d.emailConsent}, ${d.emailConsent ? new Date().toISOString() : null})
        `;
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import impossible";
    redirect(`/dashboard/clients/import?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/dashboard"); revalidatePath("/dashboard/clients");
  redirect(`/dashboard/clients?success=${valid.length}%20clients%20importés`);
}
