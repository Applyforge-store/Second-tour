import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  APP_URL: z.string().url().default("http://localhost:3000"),
  GMAIL_USER: z.string().email().optional(),
  GMAIL_APP_PASSWORD: z.string().min(8).optional(),
  FROM_NAME: z.string().default("Second Tour"),
  CRON_SECRET: z.string().min(24).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(12).optional(),
});

let cached: z.infer<typeof serverSchema> | undefined;

export function env() {
  if (!cached) {
    const parsed = serverSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(`Configuration invalide: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`);
    }
    cached = parsed.data;
  }
  return cached;
}
