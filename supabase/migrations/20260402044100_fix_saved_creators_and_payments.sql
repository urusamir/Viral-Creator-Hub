-- Ensure saved_creators table has all needed columns
-- The table may have been created with only basic columns

-- First ensure the table exists
CREATE TABLE IF NOT EXISTS saved_creators (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  creator_username text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add columns that may be missing
ALTER TABLE saved_creators ADD COLUMN IF NOT EXISTS creator_name text;
ALTER TABLE saved_creators ADD COLUMN IF NOT EXISTS platform text;
ALTER TABLE saved_creators ADD COLUMN IF NOT EXISTS followers integer DEFAULT 0;
ALTER TABLE saved_creators ADD COLUMN IF NOT EXISTS engagement_rate numeric DEFAULT 0;
ALTER TABLE saved_creators ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';

-- Add unique constraint to prevent duplicates (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'saved_creators_user_creator_unique'
  ) THEN
    ALTER TABLE saved_creators
      ADD CONSTRAINT saved_creators_user_creator_unique
      UNIQUE (user_id, creator_username);
  END IF;
END $$;

-- Disable RLS as per existing pattern
ALTER TABLE saved_creators DISABLE ROW LEVEL SECURITY;

-- Ensure calendar_slots receipt_data column is TEXT (unlimited) not varchar
ALTER TABLE calendar_slots ALTER COLUMN receipt_data TYPE text;
ALTER TABLE calendar_slots ALTER COLUMN payment_status SET DEFAULT 'pending';

-- Grant permissions
GRANT ALL ON saved_creators TO anon, authenticated;
GRANT ALL ON calendar_slots TO anon, authenticated;
