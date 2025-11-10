/*
  # Document Storage System

  1. New Tables
    - `document_files`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `filename` (text)
      - `file_type` (text)
      - `file_size` (integer)
      - `file_data` (bytea) - stores the actual PDF/image file
      - `uploaded_at` (timestamp)
      - `metadata` (jsonb)
      - `protocol_id` (uuid, optional link to fhir_document_protocols)

  2. Security
    - Enable RLS on `document_files` table
    - Add policy for users to manage their own documents
*/

CREATE TABLE IF NOT EXISTS document_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  file_data bytea NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  protocol_id uuid REFERENCES fhir_document_protocols(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE document_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON document_files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON document_files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON document_files
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON document_files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow anonymous access for demo"
  ON document_files
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_document_files_user_id ON document_files(user_id);
CREATE INDEX IF NOT EXISTS idx_document_files_protocol_id ON document_files(protocol_id);
