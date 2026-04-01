const { Client } = require('pg');

const client = new Client("postgresql://postgres.liesympjqygmzestgfoa:qN1OzluPmuRqnGIS@aws-1-eu-central-1.pooler.supabase.com:5432/postgres");

const sql = `
-- 1. Drop existing tables to start completely fresh
DROP TABLE IF EXISTS public.calendar_slots CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.saved_creators CASCADE;

-- 2. Recreate perfectly structured tables with NO RLS and NO Foreign Keys to prevent any silent blockers

CREATE TABLE public.calendar_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    influencer_name TEXT NOT NULL,
    platform TEXT,
    content_type TEXT,
    status TEXT,
    currency TEXT,
    fee NUMERIC DEFAULT 0,
    campaign TEXT,
    notes TEXT,
    payment_status TEXT DEFAULT 'pending',
    receipt_data TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'Planning',
    budget NUMERIC DEFAULT 0,
    spent NUMERIC DEFAULT 0,
    roi NUMERIC DEFAULT 0,
    platform TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.saved_creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    creator_username TEXT NOT NULL,
    creator_name TEXT NOT NULL,
    platform TEXT,
    followers NUMERIC DEFAULT 0,
    engagement_rate NUMERIC DEFAULT 0,
    categories text[] DEFAULT '{}',
    notes TEXT,
    saved_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Explicitly Disable RLS on everything to make sure it is 100% unrestricted
ALTER TABLE public.calendar_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_creators DISABLE ROW LEVEL SECURITY;

-- 4. Grant full access
GRANT ALL ON TABLE public.calendar_slots TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.campaigns TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.saved_creators TO anon, authenticated, service_role;
`;

async function executeWipe() {
  await client.connect();
  console.log("Connected to Supabase. Wiping and recreating tables...");
  try {
    await client.query(sql);
    console.log("Successfully wiped and recreated tables!");
  } catch (err) {
    console.error("Failed executing wipe:", err);
  } finally {
    await client.end();
  }
}

executeWipe();
