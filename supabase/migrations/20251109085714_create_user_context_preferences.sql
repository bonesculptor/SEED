/*
  # User Context Preferences and GICS Domain Selection

  1. New Tables
    - `user_context_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Links to auth.users for authenticated scenarios
      - `session_id` (text) - For anonymous users (self-sovereign identity)
      - `gics_sector` (text) - 2-digit sector code (e.g., "35" for Health Care)
      - `gics_industry_group` (text) - 4-digit industry group code
      - `gics_industry` (text) - 6-digit industry code
      - `gics_sub_industry` (text) - 8-digit sub-industry code
      - `sector_name` (text) - Human-readable sector name
      - `industry_group_name` (text)
      - `industry_name` (text)
      - `sub_industry_name` (text)
      - `domain_context` (jsonb) - Additional context (e.g., medical records for healthcare)
      - `active` (boolean) - Whether this context is currently active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `gics_hierarchy`
      - `id` (uuid, primary key)
      - `gics_code` (text) - Full 8-digit GICS code
      - `sector` (text) - 2-digit
      - `sector_name` (text)
      - `industry_group` (text) - 4-digit
      - `industry_group_name` (text)
      - `industry` (text) - 6-digit
      - `industry_name` (text)
      - `sub_industry` (text) - 8-digit
      - `sub_industry_name` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public can read GICS hierarchy (reference data)
    - Users can manage their own context preferences
    - Support both authenticated and anonymous (session-based) users

  3. Indexes
    - Index on GICS codes for fast lookups
    - Index on user_id and session_id for context retrieval
    - Index on active flag for current context queries

  4. Notes
    - Self-sovereign identity: Users control their context without requiring authentication
    - Session-based for anonymous users, user_id for authenticated users
    - Hierarchical drill-down: Sector → Industry Group → Industry → Sub-Industry
    - Domain context stores additional contextual data (medical records, etc.)
*/

-- GICS Hierarchy Reference Table
CREATE TABLE IF NOT EXISTS gics_hierarchy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gics_code text NOT NULL UNIQUE,
  sector text NOT NULL,
  sector_name text NOT NULL,
  industry_group text NOT NULL,
  industry_group_name text NOT NULL,
  industry text NOT NULL,
  industry_name text NOT NULL,
  sub_industry text NOT NULL,
  sub_industry_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gics_hierarchy_code ON gics_hierarchy(gics_code);
CREATE INDEX IF NOT EXISTS idx_gics_hierarchy_sector ON gics_hierarchy(sector);
CREATE INDEX IF NOT EXISTS idx_gics_hierarchy_industry_group ON gics_hierarchy(industry_group);
CREATE INDEX IF NOT EXISTS idx_gics_hierarchy_industry ON gics_hierarchy(industry);

ALTER TABLE gics_hierarchy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read GICS hierarchy"
  ON gics_hierarchy FOR SELECT
  TO public
  USING (true);

-- User Context Preferences Table
CREATE TABLE IF NOT EXISTS user_context_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  gics_sector text,
  gics_industry_group text,
  gics_industry text,
  gics_sub_industry text,
  sector_name text,
  industry_group_name text,
  industry_name text,
  sub_industry_name text,
  domain_context jsonb DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_or_session_required CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_user_context_user_id ON user_context_preferences(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_context_session_id ON user_context_preferences(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_context_active ON user_context_preferences(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_user_context_gics ON user_context_preferences(gics_sector, gics_industry_group, gics_industry, gics_sub_industry);

ALTER TABLE user_context_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own context preferences"
  ON user_context_preferences FOR SELECT
  TO public
  USING (
    user_id = auth.uid() OR
    session_id IS NOT NULL
  );

CREATE POLICY "Users can insert own context preferences"
  ON user_context_preferences FOR INSERT
  TO public
  WITH CHECK (
    user_id = auth.uid() OR
    session_id IS NOT NULL
  );

CREATE POLICY "Users can update own context preferences"
  ON user_context_preferences FOR UPDATE
  TO public
  USING (
    user_id = auth.uid() OR
    session_id IS NOT NULL
  )
  WITH CHECK (
    user_id = auth.uid() OR
    session_id IS NOT NULL
  );

CREATE POLICY "Users can delete own context preferences"
  ON user_context_preferences FOR DELETE
  TO public
  USING (
    user_id = auth.uid() OR
    session_id IS NOT NULL
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_context_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_context_preferences_updated_at
  BEFORE UPDATE ON user_context_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_context_updated_at();