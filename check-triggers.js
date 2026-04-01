import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT pg_get_triggerdef(t.oid) as def, p.proname, pg_get_functiondef(p.oid) as func_def
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    LEFT JOIN pg_proc p ON t.tgfoid = p.oid
    WHERE n.nspname = 'auth' AND c.relname = 'users';
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(console.error);
