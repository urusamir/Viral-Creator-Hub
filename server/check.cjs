const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.liesympjqygmzestgfoa:qN1OzluPmuRqnGIS@aws-0-eu-central-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  await client.connect();
  let res = await client.query('SELECT * FROM calendar_slots ORDER BY created_at DESC LIMIT 5;');
  console.log("Calendar slots:", res.rows);
  
  res = await client.query(`
    select * from pg_policies where tablename IN ('calendar_slots', 'saved_creators', 'campaigns');
  `);
  console.log("Policies:", res.rows);
  
  await client.end();
}
run().catch(console.error);
