import postgres from "postgres";
import { env } from "@/lib/env";

const globalForDb = globalThis as unknown as { secondTourSql?: ReturnType<typeof postgres> };

function getSql() {
  if (!globalForDb.secondTourSql) {
    globalForDb.secondTourSql = postgres(env().DATABASE_URL, {
      ssl: "require",
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }
  return globalForDb.secondTourSql;
}

const lazySql = function (strings: TemplateStringsArray, ...values: unknown[]) {
  const client = getSql() as unknown as (template: TemplateStringsArray, ...parameters: unknown[]) => unknown;
  return client(strings, ...values);
};

export const sql = new Proxy(lazySql, {
  get(_target, property) {
    const client = getSql();
    const value = Reflect.get(client, property);
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as ReturnType<typeof postgres>;

export type Role = "SUPER_ADMIN" | "GARAGE_ADMIN";
export type ReminderStatus = "PENDING" | "SENT" | "FAILED" | "SKIPPED";
