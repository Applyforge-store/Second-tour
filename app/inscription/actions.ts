"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";

export async function signupAction(formData: FormData) {
  const parsed = signupSchema.safeParse({
    garageName: formData.get("garageName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/inscription?error=Vérifiez%20les%20informations");

  const { garageName, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await sql.begin(async (transaction) => {
      const [garage] = await transaction<{ id: string }[]>`INSERT INTO garages (name, contact_email, trial_started_at, trial_ends_at, subscription_status)
        VALUES (${garageName}, ${email}, now(), now() + interval '30 days', 'TRIALING') RETURNING id`;
      const [user] = await transaction<{ id: string }[]>`INSERT INTO users (garage_id, email, password_hash, role)
        VALUES (${garage.id}, ${email}, ${passwordHash}, 'GARAGE_ADMIN') RETURNING id`;
      return { garageId: garage.id, userId: user.id };
    });

    await createSession({ id: result.userId, email, role: "GARAGE_ADMIN", garageId: result.garageId });
  } catch {
    redirect("/inscription?error=Cette%20adresse%20e-mail%20est%20peut-être%20déjà%20utilisée");
  }

  redirect("/dashboard");
}
