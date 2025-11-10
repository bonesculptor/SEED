/*
  # Add Context Shortcuts/Favorites

  1. New Columns to user_context_preferences
    - `is_favorite` (boolean) - Mark frequently used contexts as favorites
    - `usage_count` (integer) - Track how many times this context has been used
    - `last_used_at` (timestamptz) - Track when this context was last activated

  2. Indexes
    - Index on is_favorite for quick shortcut retrieval
    - Index on usage_count for popularity sorting

  3. Purpose
    - Allow users to mark frequently used contexts as shortcuts
    - Automatically track context usage patterns
    - Display shortcuts for quick context switching
*/

-- Add new columns to user_context_preferences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_context_preferences' AND column_name = 'is_favorite'
  ) THEN
    ALTER TABLE user_context_preferences ADD COLUMN is_favorite boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_context_preferences' AND column_name = 'usage_count'
  ) THEN
    ALTER TABLE user_context_preferences ADD COLUMN usage_count integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_context_preferences' AND column_name = 'last_used_at'
  ) THEN
    ALTER TABLE user_context_preferences ADD COLUMN last_used_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create indexes for shortcuts functionality
CREATE INDEX IF NOT EXISTS idx_user_context_favorites ON user_context_preferences(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_user_context_usage ON user_context_preferences(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_context_last_used ON user_context_preferences(last_used_at DESC);

-- Function to update usage tracking when context is activated
CREATE OR REPLACE FUNCTION increment_context_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.active = true AND OLD.active = false THEN
    NEW.usage_count = COALESCE(OLD.usage_count, 0) + 1;
    NEW.last_used_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically track usage
DROP TRIGGER IF EXISTS context_usage_tracker ON user_context_preferences;
CREATE TRIGGER context_usage_tracker
  BEFORE UPDATE ON user_context_preferences
  FOR EACH ROW
  EXECUTE FUNCTION increment_context_usage();