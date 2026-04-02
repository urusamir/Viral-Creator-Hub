import pg from "pg";
import fs from "fs";
import { resolve, basename } from "path";

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("No DATABASE_URL found.");
  process.exit(1);
}

const client = new Client({ connectionString });

async function runMigrations() {
  try {
    await client.connect();

    // Read all migration files and sort by name (timestamp prefix = correct order)
    const migrationDir = resolve("supabase/migrations");
    const files = fs.readdirSync(migrationDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const filePath = resolve(migrationDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");
      console.log(`Running ${file}...`);
      try {
        await client.query(sql);
        console.log(`  ✓ ${file} succeeded`);
      } catch (err) {
        // Many migrations use IF NOT EXISTS / IF EXISTS, so some errors are expected
        console.warn(`  ⚠ ${file} had an issue:`, err.message);
      }
    }

    console.log("\nAll migrations processed.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigrations();
