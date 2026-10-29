import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Chybí DATABASE_URL. Spusťte `vercel env pull` nebo ji doplňte do .env.local.");
  process.exit(1);
}

const sql = neon(url);
const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");

// HTTP driver pošle v jednom dotazu jen jeden příkaz.
const statements = schema
  .replace(/--.*$/gm, "")
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}

console.log(`Schéma aplikováno (${statements.length} příkazy).`);
