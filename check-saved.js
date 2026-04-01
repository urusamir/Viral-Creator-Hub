import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  await client.connect();
  const query = `
    SELECT u.email, sc.creator_handle, sc.platform
    FROM saved_creators sc
    JOIN profiles p ON p.id = sc.brand_id
    JOIN auth.users u ON u.id = p.id
    WHERE u.email = 'test_live1@example.com';
  `;
  const res = await client.query(query);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(console.error);
