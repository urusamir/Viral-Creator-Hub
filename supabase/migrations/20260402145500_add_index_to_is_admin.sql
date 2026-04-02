-- Create an index to quickly filter administrative users on the settings page
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles (is_admin) WHERE is_admin = true;
