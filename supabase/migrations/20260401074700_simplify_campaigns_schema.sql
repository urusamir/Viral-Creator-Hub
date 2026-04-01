-- Simplify Campaigns Table
-- Drop unused columns from the 8-step wizard

ALTER TABLE campaigns
  DROP COLUMN IF EXISTS notes,
  DROP COLUMN IF EXISTS campaign_type,
  DROP COLUMN IF EXISTS audience_interests,
  DROP COLUMN IF EXISTS audience_gender,
  DROP COLUMN IF EXISTS tone,
  DROP COLUMN IF EXISTS competitor_exclusivity,
  DROP COLUMN IF EXISTS exclusivity_category,
  DROP COLUMN IF EXISTS exclusivity_duration,
  DROP COLUMN IF EXISTS payment_model,
  DROP COLUMN IF EXISTS budget_per_creator,
  DROP COLUMN IF EXISTS payment_timing,
  DROP COLUMN IF EXISTS bonus_rules,
  DROP COLUMN IF EXISTS manual_creators,
  DROP COLUMN IF EXISTS creator_filters,
  DROP COLUMN IF EXISTS brand_overview,
  DROP COLUMN IF EXISTS product_details,
  DROP COLUMN IF EXISTS mandatory_requirements,
  DROP COLUMN IF EXISTS file_uploads,
  DROP COLUMN IF EXISTS kpis,
  DROP COLUMN IF EXISTS tracking_methods,
  DROP COLUMN IF EXISTS utm_base_url,
  DROP COLUMN IF EXISTS promo_code_pattern,
  DROP COLUMN IF EXISTS reporting_frequency,
  DROP COLUMN IF EXISTS export_formats;
