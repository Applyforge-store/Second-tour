"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { garageSchema } from "@/lib/validation";

export async function createGarageAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  const parsed = garageSchema.safeParse({ name:formData.get("name"), contactEmail:formData.get("contactEmail"), userEmail:formData.get("userEmail"), initialPassword:formData.get("initialPassword") });
  if (!parsed.success) redirect("/admin/garages?error=Vérifiez%20les%20informations");
  const d = parsed.data; const passwordHash = await bcrypt.hash(d.initialPassword, 12);
  try {
    await sql.begin(async (transaction) => {
      const [garage] = await transaction<{ id:string }[]>`INSERT INTO garages (name,contact_email) VALUES (${d.name},${d.contactEmail.toLowerCase()}) RETURNING id`;
      await transaction`INSERT INTO users (garage_id,email,password_hash,role) VALUES (${garage.id},${d.userEmail.toLowerCase()},${passwordHash},'GARAGE_ADMIN')`;
      await transaction`INSERT INTO audit_logs (user_id,action,entity_type,entity_id,metadata) VALUES (${admin.id},'CREATE','GARAGE',${garage.id},${transaction.json({name:d.name})})`;
    });
  } catch {
    redirect("/admin/garages?error=Cette%20adresse%20e-mail%20est%20peut-être%20déjà%20utilisée");
  }
  revalidatePath("/admin/garages"); redirect("/admin/garages?success=Garage%20créé");
}

export async function toggleGarageAction(formData: FormData) {
  await requireSuperAdmin(); const id=String(formData.get("id")??"");
  await sql`UPDATE garages SET active=NOT active, updated_at=now() WHERE id=${id}`;
  revalidatePath("/admin/garages");
}
