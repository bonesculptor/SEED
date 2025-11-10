/*
  # Make All FHIR Name Fields Nullable
  
  1. Purpose
    - Ensure consistent nullable name fields across all 8 FHIR protocol tables
    - Support flexible data import from various medical document formats
    - Allow incremental data enrichment and normalization
    
  2. Changes
    - Make given_name and family_name nullable in fhir_practitioner_protocols
    - Ensures all FHIR tables can store data in generic JSON format first
    - Structured fields can be populated later through extraction/normalization
    
  3. Tables Affected
    - fhir_patient_protocols (already fixed)
    - fhir_practitioner_protocols (fixing now)
    - Other tables use generic 'title' field which is already nullable
    
  4. Rationale
    - Medical documents often have unstructured name data
    - Some systems store full names without first/last separation
    - Data can be normalized after initial import
    - Supports batch processing and incremental updates
*/

-- Make practitioner name fields nullable
ALTER TABLE fhir_practitioner_protocols 
  ALTER COLUMN given_name DROP NOT NULL,
  ALTER COLUMN family_name DROP NOT NULL;

-- Add helpful comments
COMMENT ON COLUMN fhir_practitioner_protocols.given_name IS 'First/given name(s) - can be extracted from data.name if not provided';
COMMENT ON COLUMN fhir_practitioner_protocols.family_name IS 'Last/family name - can be extracted from data.name if not provided';

-- Verify all name-related columns across FHIR tables are now flexible
-- Patient: given_name, family_name (already nullable)
-- Practitioner: given_name, family_name (now nullable)
-- Others: Use 'title' field (already nullable)