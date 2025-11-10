/*
  # Allow Anonymous Access to FHIR Tables
  
  1. Purpose
    - Allow anonymous users to insert and view FHIR records
    - Enable demo functionality without authentication
    - Maintain security while allowing public demo access
    
  2. Changes
    - Add policies for anonymous role (anon) 
    - Allow SELECT and INSERT for all FHIR protocol tables
    - Keep existing authenticated policies intact
    
  3. Security Notes
    - This is appropriate for demo/development environments
    - Production deployments should require authentication
    - Consider disabling anon access in production
*/

-- Patient protocols - allow anon access
DROP POLICY IF EXISTS "Anonymous users can view patient records" ON fhir_patient_protocols;
CREATE POLICY "Anonymous users can view patient records"
  ON fhir_patient_protocols
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anonymous users can create patient records" ON fhir_patient_protocols;
CREATE POLICY "Anonymous users can create patient records"
  ON fhir_patient_protocols
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Practitioner protocols - allow anon access
DROP POLICY IF EXISTS "Anonymous users can view practitioners" ON fhir_practitioner_protocols;
CREATE POLICY "Anonymous users can view practitioners"
  ON fhir_practitioner_protocols
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anonymous users can create practitioners" ON fhir_practitioner_protocols;
CREATE POLICY "Anonymous users can create practitioners"
  ON fhir_practitioner_protocols
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Encounter protocols - allow anon access
DROP POLICY IF EXISTS "Anonymous users can view encounters" ON fhir_encounter_protocols;
CREATE POLICY "Anonymous users can view encounters"
  ON fhir_encounter_protocols
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anonymous users can create encounters" ON fhir_encounter_protocols;
CREATE POLICY "Anonymous users can create encounters"
  ON fhir_encounter_protocols
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Condition protocols - allow anon access
DROP POLICY IF EXISTS "Anonymous users can view conditions" ON fhir_condition_protocols;
CREATE POLICY "Anonymous users can view conditions"
  ON fhir_condition_protocols
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anonymous users can create conditions" ON fhir_condition_protocols;
CREATE POLICY "Anonymous users can create conditions"
  ON fhir_condition_protocols
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Medication protocols - allow anon access
DROP POLICY IF EXISTS "Anonymous users can view medications" ON fhir_medication_protocols;
CREATE POLICY "Anonymous users can view medications"
  ON fhir_medication_protocols
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anonymous users can create medications" ON fhir_medication_protocols;
CREATE POLICY "Anonymous users can create medications"
  ON fhir_medication_protocols
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Observation protocols - allow anon access
DROP POLICY IF EXISTS "Anonymous users can view observations" ON fhir_observation_protocols;
CREATE POLICY "Anonymous users can view observations"
  ON fhir_observation_protocols
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anonymous users can create observations" ON fhir_observation_protocols;
CREATE POLICY "Anonymous users can create observations"
  ON fhir_observation_protocols
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Procedure protocols - allow anon access
DROP POLICY IF EXISTS "Anonymous users can view procedures" ON fhir_procedure_protocols;
CREATE POLICY "Anonymous users can view procedures"
  ON fhir_procedure_protocols
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anonymous users can create procedures" ON fhir_procedure_protocols;
CREATE POLICY "Anonymous users can create procedures"
  ON fhir_procedure_protocols
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Document protocols - allow anon access
DROP POLICY IF EXISTS "Anonymous users can view documents" ON fhir_document_protocols;
CREATE POLICY "Anonymous users can view documents"
  ON fhir_document_protocols
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anonymous users can create documents" ON fhir_document_protocols;
CREATE POLICY "Anonymous users can create documents"
  ON fhir_document_protocols
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Graph edges - allow anon access
DROP POLICY IF EXISTS "Anonymous users can view graph edges" ON fhir_graph_edges;
CREATE POLICY "Anonymous users can view graph edges"
  ON fhir_graph_edges
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anonymous users can create graph edges" ON fhir_graph_edges;
CREATE POLICY "Anonymous users can create graph edges"
  ON fhir_graph_edges
  FOR INSERT
  TO anon
  WITH CHECK (true);