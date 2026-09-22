"use server";

import { revalidatePath } from "next/cache";
import { requireGarageAdmin } from "@/lib/auth";
import { generateDueReminders } from "@/lib/reminders";
import { sendReminder } from "@/lib/mailer";

export async function generateRemindersAction() {
  await requireGarageAdmin();
  await generateDueReminders();
  revalidatePath("/dashboard/reminders"); revalidatePath("/dashboard");
}

export async function sendReminderAction(formData: FormData) {
  const session = await requireGarageAdmin();
  const id = String(formData.get("id") ?? "");
  await sendReminder(id, session.garageId);
  revalidatePath("/dashboard/reminders"); revalidatePath("/dashboard");
}
