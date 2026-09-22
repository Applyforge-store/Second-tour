import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(8).max(128),
});

export const clientSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().max(80).default(""),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).default(""),
  vehicle: z.string().trim().min(1).max(120),
  plate: z.string().trim().max(30).default(""),
  lastServiceDate: z.string().date().or(z.literal("")),
  nextServiceDate: z.string().date(),
  emailConsent: z.coerce.boolean(),
});

export const garageSchema = z.object({
  name: z.string().trim().min(2).max(120),
  contactEmail: z.string().trim().email(),
  userEmail: z.string().trim().email(),
  initialPassword: z.string().min(12).max(128),
});
