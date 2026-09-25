import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import postgres from "postgres";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL manque.");
  const sql = postgres(databaseUrl, { ssl: "require", max: 1, prepare: false });
  try {
    const dbDir = path.join(process.cwd(), "db");
    const migrations = (await fs.readdir(dbDir)).filter((name) => name.endsWith(".sql")).sort();
    for (const file of migrations) {
      const migration = await fs.readFile(path.join(dbDir, file), "utf8");
      await sql.unsafe(migration);
    }

    const [{ count }] = await sql<{ count: number }[]>`SELECT count(*)::int AS count FROM users`;
    if (count === 0) {
      const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
      const password = process.env.ADMIN_PASSWORD;
      if (!email || !password || password.length < 12) {
        throw new Error("Pour créer le premier compte, renseignez ADMIN_EMAIL et ADMIN_PASSWORD (12 caractères minimum). ");
      }
      const passwordHash = await bcrypt.hash(password, 12);
      await sql`INSERT INTO users (email, password_hash, role) VALUES (${email}, ${passwordHash}, 'SUPER_ADMIN')`;
      console.log(`Compte administrateur créé pour ${email}.`);
    }
    console.log("Base de données prête.");
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
