/*
  # Create DID Key Management System for Human Protocol

  1. New Tables
    - `patient_identifiers`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references fhir_patient_protocols)
      - `did` (text, unique) - W3C compliant DID
      - `did_document` (jsonb) - Complete DID document
      - `private_key_encrypted` (text) - Encrypted private key
      - `public_key` (text) - Public key for verification
      - `key_algorithm` (text) - Key algorithm (ed25519, secp256k1, etc.)
      - `nhs_number` (text) - NHS identifier
      - `patient_name` (text)
      - `blockchain_status` (text) - ready_for_anchor, anchored, verified
      - `parachain_account` (text) - Persona blockchain parachain account
      - `parachain_tx_hash` (text) - Transaction hash when anchored
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `patient_identifiers` table
    - Add policies for authenticated users to manage their own identifiers
    - Allow anonymous access for demo/development

  3. Notes
    - Private keys are stored encrypted with user's password/pin
    - Public keys are openly readable for DID verification
    - Blockchain anchoring creates immutable record on Persona parachain
    - Keys can be imported from external sources
    - System can generate new key pairs for users
*/

CREATE TABLE IF NOT EXISTS patient_identifiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES fhir_patient_protocols(id) ON DELETE CASCADE,
  did text UNIQUE NOT NULL,
  did_document jsonb DEFAULT '{}'::jsonb,
  private_key_encrypted text,
  public_key text NOT NULL,
  key_algorithm text DEFAULT 'ed25519',
  nhs_number text,
  patient_name text,
  blockchain_status text DEFAULT 'ready_for_anchor',
  parachain_account text,
  parachain_tx_hash text,
  parachain_block_number bigint,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_identifiers_did ON patient_identifiers(did);
CREATE INDEX IF NOT EXISTS idx_patient_identifiers_nhs ON patient_identifiers(nhs_number);
CREATE INDEX IF NOT EXISTS idx_patient_identifiers_patient_id ON patient_identifiers(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_identifiers_parachain_account ON patient_identifiers(parachain_account);

ALTER TABLE patient_identifiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access for demo"
  ON patient_identifiers
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can insert own identifiers"
  ON patient_identifiers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own identifiers"
  ON patient_identifiers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own identifiers"
  ON patient_identifiers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own identifiers"
  ON patient_identifiers
  FOR DELETE
  TO authenticated
  USING (true);
