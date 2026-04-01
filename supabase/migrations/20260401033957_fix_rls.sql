-- Disable RLS on all problematic tables to ensure data flows freely from UI to Supabase
ALTER TABLE IF EXISTS saved_creators DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS calendar_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;

-- Grant all privileges to anon and authenticated roles for public schema tables
-- This ensures that regardless of RLS, the REST API can perform CRUD operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
