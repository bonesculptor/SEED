/*
  # Add Generic Columns to FHIR Protocol Tables
  
  1. Changes
    - Add `type` column to store record type
    - Add `title` column for display name
    - Add `summary` column for brief description
    - Add `data` column for flexible JSON storage
    
  2. Purpose
    - Enable backward compatibility with existing service layer
    - Allow flexible data storage alongside FHIR-specific columns
    - Support the seeding scripts and graph visualization
*/

-- Add columns to fhir_patient_protocols
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_patient_protocols' AND column_name = 'type') THEN
    ALTER TABLE fhir_patient_protocols ADD COLUMN type text DEFAULT 'patient';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_patient_protocols' AND column_name = 'title') THEN
    ALTER TABLE fhir_patient_protocols ADD COLUMN title text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_patient_protocols' AND column_name = 'summary') THEN
    ALTER TABLE fhir_patient_protocols ADD COLUMN summary text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_patient_protocols' AND column_name = 'data') THEN
    ALTER TABLE fhir_patient_protocols ADD COLUMN data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add columns to fhir_practitioner_protocols
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_practitioner_protocols' AND column_name = 'type') THEN
    ALTER TABLE fhir_practitioner_protocols ADD COLUMN type text DEFAULT 'practitioner';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_practitioner_protocols' AND column_name = 'title') THEN
    ALTER TABLE fhir_practitioner_protocols ADD COLUMN title text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_practitioner_protocols' AND column_name = 'summary') THEN
    ALTER TABLE fhir_practitioner_protocols ADD COLUMN summary text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_practitioner_protocols' AND column_name = 'data') THEN
    ALTER TABLE fhir_practitioner_protocols ADD COLUMN data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add columns to fhir_encounter_protocols
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_encounter_protocols' AND column_name = 'type') THEN
    ALTER TABLE fhir_encounter_protocols ADD COLUMN type text DEFAULT 'encounter';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_encounter_protocols' AND column_name = 'title') THEN
    ALTER TABLE fhir_encounter_protocols ADD COLUMN title text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_encounter_protocols' AND column_name = 'summary') THEN
    ALTER TABLE fhir_encounter_protocols ADD COLUMN summary text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_encounter_protocols' AND column_name = 'data') THEN
    ALTER TABLE fhir_encounter_protocols ADD COLUMN data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add columns to fhir_condition_protocols
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_condition_protocols' AND column_name = 'type') THEN
    ALTER TABLE fhir_condition_protocols ADD COLUMN type text DEFAULT 'condition';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_condition_protocols' AND column_name = 'title') THEN
    ALTER TABLE fhir_condition_protocols ADD COLUMN title text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_condition_protocols' AND column_name = 'summary') THEN
    ALTER TABLE fhir_condition_protocols ADD COLUMN summary text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_condition_protocols' AND column_name = 'data') THEN
    ALTER TABLE fhir_condition_protocols ADD COLUMN data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add columns to fhir_medication_protocols
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_medication_protocols' AND column_name = 'type') THEN
    ALTER TABLE fhir_medication_protocols ADD COLUMN type text DEFAULT 'medication';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_medication_protocols' AND column_name = 'title') THEN
    ALTER TABLE fhir_medication_protocols ADD COLUMN title text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_medication_protocols' AND column_name = 'summary') THEN
    ALTER TABLE fhir_medication_protocols ADD COLUMN summary text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_medication_protocols' AND column_name = 'data') THEN
    ALTER TABLE fhir_medication_protocols ADD COLUMN data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add columns to fhir_observation_protocols
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_observation_protocols' AND column_name = 'type') THEN
    ALTER TABLE fhir_observation_protocols ADD COLUMN type text DEFAULT 'observation';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_observation_protocols' AND column_name = 'title') THEN
    ALTER TABLE fhir_observation_protocols ADD COLUMN title text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_observation_protocols' AND column_name = 'summary') THEN
    ALTER TABLE fhir_observation_protocols ADD COLUMN summary text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_observation_protocols' AND column_name = 'data') THEN
    ALTER TABLE fhir_observation_protocols ADD COLUMN data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add columns to fhir_procedure_protocols
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_procedure_protocols' AND column_name = 'type') THEN
    ALTER TABLE fhir_procedure_protocols ADD COLUMN type text DEFAULT 'procedure';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_procedure_protocols' AND column_name = 'title') THEN
    ALTER TABLE fhir_procedure_protocols ADD COLUMN title text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_procedure_protocols' AND column_name = 'summary') THEN
    ALTER TABLE fhir_procedure_protocols ADD COLUMN summary text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_procedure_protocols' AND column_name = 'data') THEN
    ALTER TABLE fhir_procedure_protocols ADD COLUMN data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add columns to fhir_document_protocols
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_document_protocols' AND column_name = 'type') THEN
    ALTER TABLE fhir_document_protocols ADD COLUMN type text DEFAULT 'document';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_document_protocols' AND column_name = 'title') THEN
    ALTER TABLE fhir_document_protocols ADD COLUMN title text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_document_protocols' AND column_name = 'summary') THEN
    ALTER TABLE fhir_document_protocols ADD COLUMN summary text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fhir_document_protocols' AND column_name = 'data') THEN
    ALTER TABLE fhir_document_protocols ADD COLUMN data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;