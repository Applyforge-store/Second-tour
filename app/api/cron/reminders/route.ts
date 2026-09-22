import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { generateDueReminders } from "@/lib/reminders";
import { sendAllDueReminders } from "@/lib/mailer";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = env().CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const created = await generateDueReminders();
  const delivery = await sendAllDueReminders();
  return NextResponse.json({ ok: true, created, ...delivery });
}
