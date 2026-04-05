-- =====================================================================
-- Migration: Add FK constraints and updated_at triggers
-- Purpose:   Data integrity hardening — prevent orphaned rows and
--            ensure updated_at is always accurate.
-- =====================================================================

-- ─── FK Constraints ──────────────────────────────────────────────────
-- Link user-owned tables to auth.users so rows are auto-deleted
-- when a user is removed.

DO $$
BEGIN
  -- creator_lists.user_id → auth.users(id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_creator_lists_user'
  ) THEN
    ALTER TABLE creator_lists
      ADD CONSTRAINT fk_creator_lists_user
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- saved_creators.user_id → auth.users(id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_saved_creators_user'
  ) THEN
    ALTER TABLE saved_creators
      ADD CONSTRAINT fk_saved_creators_user
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- calendar_slots: add user_id FK if column and constraint both exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_slots' AND column_name = 'user_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_calendar_slots_user'
  ) THEN
    ALTER TABLE calendar_slots
      ADD CONSTRAINT fk_calendar_slots_user
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- campaigns.user_id → auth.users(id)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'user_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_campaigns_user'
  ) THEN
    ALTER TABLE campaigns
      ADD CONSTRAINT fk_campaigns_user
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ─── Auto-update updated_at trigger ──────────────────────────────────
-- Eliminates the need for frontend code to manually set updated_at.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables that have an updated_at column
DO $$
BEGIN
  -- creator_lists
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_creator_lists_updated_at'
  ) THEN
    CREATE TRIGGER trg_creator_lists_updated_at
      BEFORE UPDATE ON creator_lists
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  -- campaigns (if updated_at column exists)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'updated_at'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_campaigns_updated_at'
  ) THEN
    CREATE TRIGGER trg_campaigns_updated_at
      BEFORE UPDATE ON campaigns
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  -- calendar_slots (if updated_at column exists)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_slots' AND column_name = 'updated_at'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_calendar_slots_updated_at'
  ) THEN
    CREATE TRIGGER trg_calendar_slots_updated_at
      BEFORE UPDATE ON calendar_slots
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
