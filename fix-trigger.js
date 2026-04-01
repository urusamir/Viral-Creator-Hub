import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  await client.connect();
  const query = `
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      INSERT INTO public.profiles (id, email, role)
      VALUES (NEW.id, NEW.email, 'brand');
      
      RETURN NEW;
    END;
    $$;
  `;
  await client.query(query);
  console.log('Trigger function updated successfully.');
  await client.end();
}

main().catch(console.error);
