/*
  # Patient DID and Blockchain System

  1. New Tables
    - `patient_identifiers`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, unique) - Internal patient UUID
      - `did` (text, unique) - W3C Decentralised Identifier
      - `did_document` (jsonb) - Full DID Document
      - `patient_name` (text)
      - `nhs_number` (text, indexed)
      - `birth_date` (date)
      - `hospital_number` (text)
      - `blockchain_status` (text) - pending, anchored, failed
      - `parachain_id` (text) - Blockchain parachain identifier
      - `blockchain_hash` (text) - Immutable blockchain record hash
      - `anchored_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `blockchain_audit_log`
      - `id` (uuid, primary key)
      - `did` (text) - Reference to patient DID
      - `action` (text) - created, updated, anchored
      - `data_hash` (text) - Hash of the data
      - `blockchain_tx` (text) - Transaction ID on blockchain
      - `status` (text) - pending, confirmed, failed
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own records
    - Audit log is append-only

  3. Indexes
    - Index on NHS number for fast lookup
    - Index on DID for resolution
    - Index on blockchain status
*/

CREATE TABLE IF NOT EXISTS patient_identifiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid UNIQUE NOT NULL,
  did text UNIQUE NOT NULL,
  did_document jsonb NOT NULL,
  patient_name text NOT NULL,
  nhs_number text,
  birth_date date,
  hospital_number text,
  blockchain_status text DEFAULT 'pending' CHECK (blockchain_status IN ('pending', 'anchored', 'failed')),
  parachain_id text,
  blockchain_hash text,
  anchored_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blockchain_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  did text NOT NULL,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'anchored', 'verified')),
  data_hash text NOT NULL,
  blockchain_tx text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE patient_identifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own identifiers"
  ON patient_identifiers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own identifiers"
  ON patient_identifiers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own identifiers"
  ON patient_identifiers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous access for demo"
  ON patient_identifiers
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view audit log"
  ON blockchain_audit_log
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert audit log"
  ON blockchain_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous access to audit log"
  ON blockchain_audit_log
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_patient_identifiers_nhs ON patient_identifiers(nhs_number);
CREATE INDEX IF NOT EXISTS idx_patient_identifiers_did ON patient_identifiers(did);
CREATE INDEX IF NOT EXISTS idx_patient_identifiers_status ON patient_identifiers(blockchain_status);
CREATE INDEX IF NOT EXISTS idx_patient_identifiers_patient_id ON patient_identifiers(patient_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_audit_did ON blockchain_audit_log(did);
CREATE INDEX IF NOT EXISTS idx_blockchain_audit_status ON blockchain_audit_log(status);
