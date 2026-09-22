"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireGarageAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function updateSettingsAction(formData: FormData) {
  const session = await requireGarageAdmin();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim().toLowerCase();
  const reminderDays = Number(formData.get("reminderDays"));
  const subject = String(formData.get("subject") ?? "").trim();
  const template = String(formData.get("template") ?? "").trim();
  if (!/^\S+@\S+\.\S+$/.test(contactEmail) || !Number.isInteger(reminderDays) || reminderDays < 0 || reminderDays > 120 || !subject || !template) {
    redirect("/dashboard/settings?error=Vérifiez%20les%20réglages");
  }
  await sql`UPDATE garages SET contact_email=${contactEmail}, reminder_days_before=${reminderDays}, email_subject=${subject}, email_template=${template}, updated_at=now() WHERE id=${session.garageId}`;
  await sql`INSERT INTO audit_logs (garage_id,user_id,action,entity_type,entity_id) VALUES (${session.garageId},${session.id},'UPDATE','GARAGE',${session.garageId})`;
  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?success=Réglages%20enregistrés");
}

export async function changePasswordAction(formData: FormData) {
  const session = await requireGarageAdmin();
  const current=String(formData.get("currentPassword")??"");
  const next=String(formData.get("newPassword")??"");
  if(next.length<12||next.length>128) redirect("/dashboard/settings?error=Le%20nouveau%20mot%20de%20passe%20doit%20contenir%20au%20moins%2012%20caractères");
  const [user]=await sql<{password_hash:string}[]>`SELECT password_hash FROM users WHERE id=${session.id} LIMIT 1`;
  if(!user||!(await bcrypt.compare(current,user.password_hash))) redirect("/dashboard/settings?error=Mot%20de%20passe%20actuel%20incorrect");
  const hash=await bcrypt.hash(next,12);
  await sql`UPDATE users SET password_hash=${hash} WHERE id=${session.id}`;
  await sql`INSERT INTO audit_logs (garage_id,user_id,action,entity_type,entity_id) VALUES (${session.garageId},${session.id},'CHANGE_PASSWORD','USER',${session.id})`;
  redirect("/dashboard/settings?success=Mot%20de%20passe%20modifié");
}
