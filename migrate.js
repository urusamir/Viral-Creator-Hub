import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  await client.connect();
  
  try {
    const res = await client.query(`
      ALTER TABLE IF EXISTS "calendar_slots" ADD COLUMN IF NOT EXISTS "campaign_id" text;
    `);
    console.log("Migration successful");
  } catch(e) {
    console.error("Migration failed", e);
  } finally {
    await client.end();
  }
}

run();
