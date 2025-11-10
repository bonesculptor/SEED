/*
  # Make protocol_id Nullable in FHIR Tables
  
  1. Purpose
    - Allow FHIR records to exist without protocol integration
    - Enable demo data seeding before protocol association
    - Support incremental protocol adoption
    
  2. Changes
    - Make protocol_id nullable in all FHIR protocol tables
    - Records can be created without protocol_id initially
    - Protocol_id can be added later when protocols are integrated
    
  3. Rationale
    - FHIR records should stand alone
    - Protocol association is a feature enhancement, not a requirement
    - Supports phased implementation approach
*/

-- Make protocol_id nullable in all FHIR tables
ALTER TABLE fhir_patient_protocols 
  ALTER COLUMN protocol_id DROP NOT NULL;

ALTER TABLE fhir_practitioner_protocols 
  ALTER COLUMN protocol_id DROP NOT NULL;

ALTER TABLE fhir_encounter_protocols 
  ALTER COLUMN protocol_id DROP NOT NULL;

ALTER TABLE fhir_condition_protocols 
  ALTER COLUMN protocol_id DROP NOT NULL;

ALTER TABLE fhir_medication_protocols 
  ALTER COLUMN protocol_id DROP NOT NULL;

ALTER TABLE fhir_observation_protocols 
  ALTER COLUMN protocol_id DROP NOT NULL;

ALTER TABLE fhir_procedure_protocols 
  ALTER COLUMN protocol_id DROP NOT NULL;

ALTER TABLE fhir_document_protocols 
  ALTER COLUMN protocol_id DROP NOT NULL;