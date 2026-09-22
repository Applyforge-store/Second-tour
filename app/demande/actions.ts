"use server";

import { redirect } from "next/navigation";
import { sql } from "@/lib/db";

export async function leadAction(formData: FormData) {
  if (String(formData.get("website") ?? "")) redirect("/demande?sent=1");
  const garageName=String(formData.get("garageName")??"").trim().slice(0,120);
  const contactName=String(formData.get("contactName")??"").trim().slice(0,120);
  const email=String(formData.get("email")??"").trim().toLowerCase().slice(0,254);
  const message=String(formData.get("message")??"").trim().slice(0,1000);
  if (garageName.length<2||contactName.length<2||!/^\S+@\S+\.\S+$/.test(email)) redirect("/demande?error=Vérifiez%20les%20informations");
  const [recent]=await sql<{count:number}[]>`SELECT count(*)::int AS count FROM leads WHERE lower(email)=${email} AND created_at>now()-interval '10 minutes'`;
  if ((recent?.count??0)>0) redirect("/demande?sent=1");
  await sql`INSERT INTO leads (garage_name,contact_name,email,message) VALUES (${garageName},${contactName},${email},${message})`;
  redirect("/demande?sent=1");
}
