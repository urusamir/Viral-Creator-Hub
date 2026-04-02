-- Table to track emails that have been pre-authorized for admin access.
-- Using a separate table avoids creating fake profile rows with random UUIDs
-- that would conflict with the real profile created when the user signs up via Supabase auth.
CREATE TABLE IF NOT EXISTS pending_admins (
  email TEXT PRIMARY KEY,
  granted_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS — allow anon/authenticated to read (to validate signup) and write (admin grants)
GRANT ALL ON pending_admins TO anon, authenticated;
