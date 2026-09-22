"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) redirect("/login?error=Identifiants%20invalides");
  const [user] = await sql<{
    id: string; email: string; password_hash: string; role: "SUPER_ADMIN" | "GARAGE_ADMIN"; garage_id: string | null; active: boolean;
  }[]>`SELECT id, email, password_hash, role, garage_id, active FROM users WHERE lower(email) = ${parsed.data.email} LIMIT 1`;
  if (!user?.active || !(await bcrypt.compare(parsed.data.password, user.password_hash))) {
    redirect("/login?error=E-mail%20ou%20mot%20de%20passe%20incorrect");
  }
  await sql`UPDATE users SET last_login_at = now() WHERE id = ${user.id}`;
  await createSession({ id: user.id, email: user.email, role: user.role, garageId: user.garage_id });
  redirect(user.role === "SUPER_ADMIN" ? "/admin/garages" : "/dashboard");
}
