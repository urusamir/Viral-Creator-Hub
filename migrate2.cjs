const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  await client.connect();
  try {
    await client.query("ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';");
    await client.query("ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS receipt_data JSONB DEFAULT NULL;");
    console.log("Migration successful");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

run();
