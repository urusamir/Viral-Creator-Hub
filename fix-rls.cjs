const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.liesympjqygmzestgfoa:qN1OzluPmuRqnGIS@aws-0-eu-central-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  await client.connect();
  console.log("Connected directly to Supabase!");
  const res = await client.query(`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`);
  console.log(res.rows);
  await client.end();
}
run().catch(console.error);
