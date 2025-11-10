/*
  # API Settings Table

  1. New Table
    - `api_settings` - Store API configuration and keys
      - `id` (uuid, primary key)
      - `api_name` (text) - Name of the API (OpenAI, Anthropic, etc.)
      - `api_key` (text) - Private API key (encrypted at rest by Supabase)
      - `base_url` (text) - Optional base URL for API endpoint
      - `enabled` (boolean) - Whether this API is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Public read/write for demo (in production, restrict to authenticated users)
    
  3. Notes
    - API keys are stored as plain text in database
    - Supabase provides encryption at rest by default
    - For production, consider additional encryption layers
*/

CREATE TABLE IF NOT EXISTS api_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_name text NOT NULL,
  api_key text NOT NULL,
  base_url text,
  enabled boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_settings_enabled ON api_settings(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_api_settings_api_name ON api_settings(api_name);

ALTER TABLE api_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view api settings"
  ON api_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert api settings"
  ON api_settings FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update api settings"
  ON api_settings FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete api settings"
  ON api_settings FOR DELETE
  TO public
  USING (true);
