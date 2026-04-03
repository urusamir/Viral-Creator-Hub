const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.liesympjqygmzestgfoa:qN1OzluPmuRqnGIS@aws-1-eu-central-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    await client.connect();
    console.log("Connected directly to Supabase!");

    const sql = fs.readFileSync('supabase/migrations/20260402044100_fix_saved_creators_and_payments.sql', 'utf8');
    await client.query(sql);
    
    console.log("Successfully applied the migration.");
    
    const checkRes = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'saved_creators';`);
    console.log("Current columns for saved_creators:", checkRes.rows);

    process.exit(0);
  } catch(e) {
    console.error("FAILED ERROR:", e);
    process.exit(1);
  }
}

run();
