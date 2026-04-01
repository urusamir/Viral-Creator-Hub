const { Client } = require('pg');

async function run() {
  console.log("Starting script with direct connection URL...");
  const client = new Client({
    connectionString: 'postgresql://postgres:qN1OzluPmuRqnGIS@db.liesympjqygmzestgfoa.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    console.log("Connecting...");
    await client.connect();
    console.log("Connected directly to Supabase!");

    console.log("Checking RLS policies...");
    const checkRes = await client.query(`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`);
    console.log("Current tables and RLS status:", checkRes.rows);

    console.log("Disabling RLS on tables...");
    await client.query(`
      ALTER TABLE IF EXISTS saved_creators DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS calendar_slots DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS campaigns DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS brands DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
      
      -- Also let's grant all privileges just in case
      GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
    `);
    
    console.log("Successfully disabled RLS and granted access.");
    process.exit(0);
  } catch(e) {
    console.error("FAILED ERROR:", e);
    process.exit(1);
  }
}

run();
