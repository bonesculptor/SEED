/*
  # Make FHIR Patient Fields Nullable
  
  1. Purpose
    - Allow FHIR patient records with flexible data structures
    - Support both structured fields and generic data JSON
    - Enable import from various medical document formats
    
  2. Changes
    - Make given_name, family_name, gender, birth_date nullable
    - These can be populated from the data JSON field if present
    - Allows records to exist with minimal required fields
    
  3. Rationale
    - Not all medical documents have structured name fields
    - Some systems store full names only
    - Data can be extracted and normalized later
    - Supports incremental data enrichment
*/

-- Make patient demographic fields nullable
ALTER TABLE fhir_patient_protocols 
  ALTER COLUMN given_name DROP NOT NULL,
  ALTER COLUMN family_name DROP NOT NULL,
  ALTER COLUMN gender DROP NOT NULL,
  ALTER COLUMN birth_date DROP NOT NULL;

-- Add helpful comment
COMMENT ON COLUMN fhir_patient_protocols.given_name IS 'First/given name(s) - can be extracted from data.name if not provided';
COMMENT ON COLUMN fhir_patient_protocols.family_name IS 'Last/family name - can be extracted from data.name if not provided';
COMMENT ON COLUMN fhir_patient_protocols.gender IS 'Gender - can be extracted from data.gender if not provided';
COMMENT ON COLUMN fhir_patient_protocols.birth_date IS 'Date of birth - can be extracted from data.birthDate if not provided';