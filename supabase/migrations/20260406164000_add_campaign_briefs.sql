-- Add a new jsonb column for multiple Campaign Briefs
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS briefs JSONB DEFAULT '[]';
