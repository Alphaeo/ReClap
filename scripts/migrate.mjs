import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const sql = neon(url);

const migration = readFileSync(
  join(__dirname, "../drizzle/0000_handy_maestro.sql"),
  "utf-8"
);

// Split on drizzle statement-breakpoint markers
const statements = migration
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

console.log(`Running ${statements.length} statements...`);
for (const statement of statements) {
  await sql.query(statement);
  console.log("✓", statement.slice(0, 60).replace(/\n/g, " "));
}
console.log("\n✅ Migration complete.");
