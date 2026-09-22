"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireGarageAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { clientSchema } from "@/lib/validation";

function input(formData: FormData) {
  return {
    firstName: formData.get("firstName"), lastName: formData.get("lastName") ?? "",
    email: formData.get("email"), phone: formData.get("phone") ?? "", vehicle: formData.get("vehicle"),
    plate: formData.get("plate") ?? "", lastServiceDate: formData.get("lastServiceDate") ?? "",
    nextServiceDate: formData.get("nextServiceDate"), emailConsent: formData.get("emailConsent") === "on",
  };
}

export async function createClientAction(formData: FormData) {
  const session = await requireGarageAdmin();
  const parsed = clientSchema.safeParse(input(formData));
  if (!parsed.success) redirect("/dashboard/clients/new?error=Vérifiez%20les%20champs%20du%20formulaire");
  const d = parsed.data;
  await sql`
    INSERT INTO clients (garage_id, first_name, last_name, email, phone, vehicle, plate, last_service_date, next_service_date, email_consent, consent_recorded_at)
    VALUES (${session.garageId}, ${d.firstName}, ${d.lastName}, ${d.email.toLowerCase()}, ${d.phone}, ${d.vehicle}, ${d.plate}, ${d.lastServiceDate || null}, ${d.nextServiceDate}, ${d.emailConsent}, ${d.emailConsent ? new Date().toISOString() : null})
  `;
  await sql`INSERT INTO audit_logs (garage_id, user_id, action, entity_type) VALUES (${session.garageId}, ${session.id}, 'CREATE', 'CLIENT')`;
  revalidatePath("/dashboard"); revalidatePath("/dashboard/clients");
  redirect("/dashboard/clients?success=Client%20ajouté");
}

export async function updateClientAction(id: string, formData: FormData) {
  const session = await requireGarageAdmin();
  const parsed = clientSchema.safeParse(input(formData));
  if (!parsed.success) redirect(`/dashboard/clients/${id}?error=Vérifiez%20les%20champs`);
  const d = parsed.data;
  await sql`
    UPDATE clients SET first_name=${d.firstName}, last_name=${d.lastName}, email=${d.email.toLowerCase()}, phone=${d.phone},
      vehicle=${d.vehicle}, plate=${d.plate}, last_service_date=${d.lastServiceDate || null}, next_service_date=${d.nextServiceDate},
      email_consent=${d.emailConsent}, consent_recorded_at=CASE WHEN ${d.emailConsent} AND NOT email_consent THEN now() WHEN NOT ${d.emailConsent} THEN NULL ELSE consent_recorded_at END,
      updated_at=now()
    WHERE id=${id} AND garage_id=${session.garageId}
  `;
  revalidatePath("/dashboard"); revalidatePath("/dashboard/clients");
  redirect("/dashboard/clients?success=Client%20modifié");
}

export async function archiveClientAction(formData: FormData) {
  const session = await requireGarageAdmin();
  const id = String(formData.get("id") ?? "");
  await sql`UPDATE clients SET active=false, updated_at=now() WHERE id=${id} AND garage_id=${session.garageId}`;
  await sql`UPDATE reminders SET status='SKIPPED', updated_at=now() WHERE client_id=${id} AND garage_id=${session.garageId} AND status='PENDING'`;
  revalidatePath("/dashboard"); revalidatePath("/dashboard/clients");
}
