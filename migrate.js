import pg from "pg";
import fs from "fs";
import { resolve } from "path";

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
    
    console.log("Running create_lists.sql...");
    const sql = fs.readFileSync(resolve("supabase/migrations/20260401142200_create_lists.sql"), "utf-8");
    await client.query(sql);
    console.log("Success.");

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigrations();
