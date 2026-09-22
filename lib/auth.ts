import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { sql, type Role } from "@/lib/db";
import { env } from "@/lib/env";

const COOKIE_NAME = "second_tour_session";
const key = () => new TextEncoder().encode(env().SESSION_SECRET);

export type SessionUser = {
  id: string;
  email: string;
  role: Role;
  garageId: string | null;
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ email: user.email, role: user.role, garageId: user.garageId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(key());
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, expires: new Date(0), path: "/" });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.role !== "string") return null;
    const role = payload.role as Role;
    const garageId = typeof payload.garageId === "string" ? payload.garageId : null;
    const [user] = await sql<{ active: boolean; garage_active: boolean | null }[]>`
      SELECT u.active, g.active AS garage_active FROM users u
      LEFT JOIN garages g ON g.id=u.garage_id WHERE u.id=${payload.sub} LIMIT 1
    `;
    if (!user?.active || (role === "GARAGE_ADMIN" && user.garage_active !== true)) return null;
    return { id: payload.sub, email: payload.email, role, garageId };
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireGarageAdmin() {
  const session = await requireSession();
  if (session.role !== "GARAGE_ADMIN" || !session.garageId) redirect("/admin/garages");
  return session as SessionUser & { garageId: string };
}

export async function requireSuperAdmin() {
  const session = await requireSession();
  if (session.role !== "SUPER_ADMIN") redirect("/dashboard");
  return session;
}
