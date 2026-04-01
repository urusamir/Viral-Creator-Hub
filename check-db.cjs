const { Client } = require('pg');

const client = new Client("postgresql://postgres.liesympjqygmzestgfoa:qN1OzluPmuRqnGIS@aws-1-eu-central-1.pooler.supabase.com:5432/postgres");

async function check() {
  await client.connect();
  const res = await client.query('SELECT * FROM saved_creators');
  console.log("saved_creators:", res.rows);
  const res2 = await client.query('SELECT * FROM calendar_slots');
  console.log("calendar_slots:", res2.rows);
  await client.end();
}

check();
