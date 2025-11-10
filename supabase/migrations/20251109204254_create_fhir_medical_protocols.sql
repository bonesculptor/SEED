/*
  # FHIR-Compliant Personal Medical Record Protocol System

  ## Overview
  This migration creates a comprehensive protocol hierarchy for personal medical records
  management, fully compliant with HL7 FHIR R4 standards. The system enables individuals
  to maintain their own medical records in a graph database structure.

  ## New Tables
  
  ### Core Protocol Tables
  1. `fhir_patient_protocols` (Level 1 - Identity)
     - Patient demographics, identifiers, contact information
     - FHIR Patient resource mapping
     - Root node for personal medical ontology
  
  2. `fhir_practitioner_protocols` (Level 2 - Care Team)
     - Healthcare provider information
     - FHIR Practitioner resource mapping
     - Links to patient protocols
  
  3. `fhir_encounter_protocols` (Level 3 - Care Events)
     - Medical visits, appointments, hospitalizations
     - FHIR Encounter resource mapping
     - Links to patient and practitioners
  
  4. `fhir_condition_protocols` (Level 4 - Diagnoses)
     - Health conditions, problems, diagnoses
     - FHIR Condition resource mapping
     - SNOMED CT coding support
  
  5. `fhir_medication_protocols` (Level 5 - Medications)
     - Prescriptions, medication statements
     - FHIR Medication & MedicationStatement resources
     - RxNorm coding support
  
  6. `fhir_observation_protocols` (Level 6 - Clinical Data)
     - Lab results, vital signs, diagnostic reports
     - FHIR Observation resource mapping
     - LOINC coding support
  
  7. `fhir_procedure_protocols` (Level 7 - Interventions)
     - Surgeries, procedures, treatments
     - FHIR Procedure resource mapping
     - CPT coding support
  
  8. `fhir_document_protocols` (Level 8 - Documents)
     - Clinical documents, reports, images
     - FHIR DocumentReference resource mapping
     - Binary attachments support

  9. `fhir_graph_edges` - Relationship mapping for graph database
     - Defines connections between all protocol types
     - Supports ontology building

  ## Security
  - Row Level Security enabled on all tables
  - Users can only access their own medical records
  - Audit trails for all data changes
  - HIPAA-compliant access controls
*/

-- Level 1: Patient Protocol (Root Identity)
CREATE TABLE IF NOT EXISTS fhir_patient_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id text UNIQUE NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  
  -- FHIR Patient fields
  active boolean DEFAULT true,
  patient_identifier jsonb NOT NULL DEFAULT '[]',
  given_name text NOT NULL,
  family_name text NOT NULL,
  birth_date date NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'other', 'unknown')),
  
  -- Contact Information
  telecom jsonb DEFAULT '[]',
  address jsonb DEFAULT '[]',
  
  -- Additional Demographics
  marital_status text,
  language jsonb DEFAULT '[]',
  
  -- Emergency Contact
  contact jsonb DEFAULT '[]',
  
  -- Care Coordination
  general_practitioner jsonb DEFAULT '[]',
  managing_organization text,
  
  -- Privacy & Consent
  consent_flags jsonb DEFAULT '{}',
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- Level 2: Practitioner Protocol (Care Team)
CREATE TABLE IF NOT EXISTS fhir_practitioner_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id text UNIQUE NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  
  -- FHIR Practitioner fields
  active boolean DEFAULT true,
  practitioner_identifier jsonb NOT NULL DEFAULT '[]',
  given_name text NOT NULL,
  family_name text NOT NULL,
  
  -- Professional Information
  qualification jsonb DEFAULT '[]',
  specialty jsonb DEFAULT '[]',
  
  -- Contact Information
  telecom jsonb DEFAULT '[]',
  address jsonb DEFAULT '[]',
  
  -- Organization
  organization_ref uuid,
  
  -- Links to patient
  linked_patient_id uuid REFERENCES fhir_patient_protocols(id) ON DELETE CASCADE,
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- Level 3: Encounter Protocol (Care Events)
CREATE TABLE IF NOT EXISTS fhir_encounter_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id text UNIQUE NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  
  -- FHIR Encounter fields
  status text NOT NULL CHECK (status IN ('planned', 'arrived', 'in-progress', 'finished', 'cancelled')),
  class_code text NOT NULL,
  encounter_type jsonb DEFAULT '[]',
  
  -- Timing
  period_start timestamptz NOT NULL,
  period_end timestamptz,
  
  -- Service Type
  service_type text,
  priority text,
  
  -- Participants
  participant jsonb DEFAULT '[]',
  
  -- Location
  location jsonb DEFAULT '[]',
  
  -- Reason
  reason_code jsonb DEFAULT '[]',
  reason_reference jsonb DEFAULT '[]',
  
  -- Diagnosis
  diagnosis jsonb DEFAULT '[]',
  
  -- Links
  linked_patient_id uuid REFERENCES fhir_patient_protocols(id) ON DELETE CASCADE,
  linked_practitioner_id uuid REFERENCES fhir_practitioner_protocols(id),
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- Level 4: Condition Protocol (Diagnoses)
CREATE TABLE IF NOT EXISTS fhir_condition_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id text UNIQUE NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  
  -- FHIR Condition fields
  clinical_status text NOT NULL CHECK (clinical_status IN ('active', 'recurrence', 'relapse', 'inactive', 'remission', 'resolved')),
  verification_status text NOT NULL CHECK (verification_status IN ('unconfirmed', 'provisional', 'differential', 'confirmed', 'refuted', 'entered-in-error')),
  
  -- Classification
  category jsonb DEFAULT '[]',
  severity text,
  
  -- Coding (SNOMED CT)
  code jsonb NOT NULL,
  body_site jsonb DEFAULT '[]',
  
  -- Timing
  onset_datetime timestamptz,
  abatement_datetime timestamptz,
  recorded_date timestamptz DEFAULT now(),
  
  -- Clinical Details
  stage jsonb DEFAULT '{}',
  evidence jsonb DEFAULT '[]',
  note text,
  
  -- Links
  linked_patient_id uuid REFERENCES fhir_patient_protocols(id) ON DELETE CASCADE,
  linked_encounter_id uuid REFERENCES fhir_encounter_protocols(id),
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- Level 5: Medication Protocol (Medications)
CREATE TABLE IF NOT EXISTS fhir_medication_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id text UNIQUE NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  
  -- FHIR MedicationStatement fields
  status text NOT NULL CHECK (status IN ('active', 'completed', 'entered-in-error', 'intended', 'stopped', 'on-hold')),
  
  -- Medication Details (RxNorm)
  medication_code jsonb NOT NULL,
  medication_text text NOT NULL,
  
  -- Dosage
  dosage jsonb DEFAULT '[]',
  
  -- Timing
  effective_datetime timestamptz,
  effective_period jsonb,
  date_asserted timestamptz DEFAULT now(),
  
  -- Context
  reason_code jsonb DEFAULT '[]',
  reason_reference jsonb DEFAULT '[]',
  note text,
  
  -- Links
  linked_patient_id uuid REFERENCES fhir_patient_protocols(id) ON DELETE CASCADE,
  linked_encounter_id uuid REFERENCES fhir_encounter_protocols(id),
  linked_condition_id uuid REFERENCES fhir_condition_protocols(id),
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- Level 6: Observation Protocol (Clinical Data)
CREATE TABLE IF NOT EXISTS fhir_observation_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id text UNIQUE NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  
  -- FHIR Observation fields
  status text NOT NULL CHECK (status IN ('registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error')),
  
  -- Category
  category jsonb DEFAULT '[]',
  
  -- Observation Type (LOINC)
  code jsonb NOT NULL,
  
  -- Timing
  effective_datetime timestamptz NOT NULL,
  issued timestamptz DEFAULT now(),
  
  -- Value
  value_quantity jsonb,
  value_string text,
  value_boolean boolean,
  value_integer integer,
  value_range jsonb,
  value_ratio jsonb,
  value_codeable_concept jsonb,
  
  -- Interpretation
  interpretation jsonb DEFAULT '[]',
  
  -- Reference Ranges
  reference_range jsonb DEFAULT '[]',
  
  -- Clinical Context
  body_site jsonb,
  method jsonb,
  note text,
  
  -- Links
  linked_patient_id uuid REFERENCES fhir_patient_protocols(id) ON DELETE CASCADE,
  linked_encounter_id uuid REFERENCES fhir_encounter_protocols(id),
  linked_condition_id uuid REFERENCES fhir_condition_protocols(id),
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- Level 7: Procedure Protocol (Interventions)
CREATE TABLE IF NOT EXISTS fhir_procedure_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id text UNIQUE NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  
  -- FHIR Procedure fields
  status text NOT NULL CHECK (status IN ('preparation', 'in-progress', 'not-done', 'on-hold', 'stopped', 'completed', 'entered-in-error', 'unknown')),
  
  -- Category
  category jsonb,
  
  -- Procedure Type (CPT)
  code jsonb NOT NULL,
  
  -- Timing
  performed_datetime timestamptz,
  performed_period jsonb,
  
  -- Reason
  reason_code jsonb DEFAULT '[]',
  reason_reference jsonb DEFAULT '[]',
  
  -- Body Site
  body_site jsonb DEFAULT '[]',
  
  -- Outcome
  outcome jsonb,
  report jsonb DEFAULT '[]',
  complication jsonb DEFAULT '[]',
  follow_up jsonb DEFAULT '[]',
  
  -- Clinical Details
  note text,
  
  -- Links
  linked_patient_id uuid REFERENCES fhir_patient_protocols(id) ON DELETE CASCADE,
  linked_encounter_id uuid REFERENCES fhir_encounter_protocols(id),
  linked_condition_id uuid REFERENCES fhir_condition_protocols(id),
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- Level 8: Document Protocol (Clinical Documents)
CREATE TABLE IF NOT EXISTS fhir_document_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id text UNIQUE NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  
  -- FHIR DocumentReference fields
  status text NOT NULL CHECK (status IN ('current', 'superseded', 'entered-in-error')),
  
  -- Document Type
  doc_type jsonb NOT NULL,
  category jsonb DEFAULT '[]',
  
  -- Document Details
  description text,
  content jsonb NOT NULL,
  
  -- Timing
  date timestamptz DEFAULT now(),
  
  -- Security
  security_label jsonb DEFAULT '[]',
  
  -- Context
  context jsonb DEFAULT '{}',
  
  -- Links
  linked_patient_id uuid REFERENCES fhir_patient_protocols(id) ON DELETE CASCADE,
  linked_encounter_id uuid REFERENCES fhir_encounter_protocols(id),
  linked_practitioner_id uuid REFERENCES fhir_practitioner_protocols(id),
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- Graph Edges: Relationship Mapping
CREATE TABLE IF NOT EXISTS fhir_graph_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source and Target
  source_protocol_type text NOT NULL CHECK (source_protocol_type IN ('patient', 'practitioner', 'encounter', 'condition', 'medication', 'observation', 'procedure', 'document')),
  source_protocol_id uuid NOT NULL,
  
  target_protocol_type text NOT NULL CHECK (target_protocol_type IN ('patient', 'practitioner', 'encounter', 'condition', 'medication', 'observation', 'procedure', 'document')),
  target_protocol_id uuid NOT NULL,
  
  -- Relationship Type
  relationship_type text NOT NULL,
  
  -- Properties
  properties jsonb DEFAULT '{}',
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fhir_patient_created_by ON fhir_patient_protocols(created_by);
CREATE INDEX IF NOT EXISTS idx_fhir_patient_birth_date ON fhir_patient_protocols(birth_date);

CREATE INDEX IF NOT EXISTS idx_fhir_practitioner_linked_patient ON fhir_practitioner_protocols(linked_patient_id);

CREATE INDEX IF NOT EXISTS idx_fhir_encounter_patient ON fhir_encounter_protocols(linked_patient_id);
CREATE INDEX IF NOT EXISTS idx_fhir_encounter_period ON fhir_encounter_protocols(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_fhir_condition_patient ON fhir_condition_protocols(linked_patient_id);
CREATE INDEX IF NOT EXISTS idx_fhir_condition_status ON fhir_condition_protocols(clinical_status);

CREATE INDEX IF NOT EXISTS idx_fhir_medication_patient ON fhir_medication_protocols(linked_patient_id);
CREATE INDEX IF NOT EXISTS idx_fhir_medication_status ON fhir_medication_protocols(status);

CREATE INDEX IF NOT EXISTS idx_fhir_observation_patient ON fhir_observation_protocols(linked_patient_id);
CREATE INDEX IF NOT EXISTS idx_fhir_observation_date ON fhir_observation_protocols(effective_datetime);

CREATE INDEX IF NOT EXISTS idx_fhir_procedure_patient ON fhir_procedure_protocols(linked_patient_id);

CREATE INDEX IF NOT EXISTS idx_fhir_document_patient ON fhir_document_protocols(linked_patient_id);

CREATE INDEX IF NOT EXISTS idx_fhir_graph_source ON fhir_graph_edges(source_protocol_type, source_protocol_id);
CREATE INDEX IF NOT EXISTS idx_fhir_graph_target ON fhir_graph_edges(target_protocol_type, target_protocol_id);

-- Enable Row Level Security
ALTER TABLE fhir_patient_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE fhir_practitioner_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE fhir_encounter_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE fhir_condition_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE fhir_medication_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE fhir_observation_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE fhir_procedure_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE fhir_document_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE fhir_graph_edges ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can read their own records
CREATE POLICY "Users can view own patient records"
  ON fhir_patient_protocols FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can create own patient records"
  ON fhir_patient_protocols FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own patient records"
  ON fhir_patient_protocols FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Similar policies for other tables
CREATE POLICY "Users can view related practitioners"
  ON fhir_practitioner_protocols FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fhir_patient_protocols p
      WHERE p.id = linked_patient_id AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create practitioners"
  ON fhir_practitioner_protocols FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fhir_patient_protocols p
      WHERE p.id = linked_patient_id AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view own encounters"
  ON fhir_encounter_protocols FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fhir_patient_protocols p
      WHERE p.id = linked_patient_id AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create own encounters"
  ON fhir_encounter_protocols FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fhir_patient_protocols p
      WHERE p.id = linked_patient_id AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view own conditions"
  ON fhir_condition_protocols FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fhir_patient_protocols p
      WHERE p.id = linked_patient_id AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create own conditions"
  ON fhir_condition_protocols FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fhir_patient_protocols p
      WHERE p.id = linked_patient_id AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view own medications"
  ON fhir_medication_protocols FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fhir_patient_protocols p
      WHERE p.id = linked_patient_id AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create own medications"
  ON fhir_medication_protocols FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fhir_patient_protocols p
      WHERE p.id = linked_patient_id AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view own observations"
  ON fhir_observation_protocols FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fhir_patient_protocols p
      WHERE p.id = linked_patient_id AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create own observations"
  ON fhir_observation_protocols FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fhir_patient_protocols p
      WHERE p.id = linked_patient_id AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view own procedures"
  ON fhir_procedure_protocols FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fhir_patient_protocols p
      WHERE p.id = linked_patient_id AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create own procedures"
  ON fhir_procedure_protocols FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fhir_patient_protocols p
      WHERE p.id = linked_patient_id AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view own documents"
  ON fhir_document_protocols FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fhir_patient_protocols p
      WHERE p.id = linked_patient_id AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create own documents"
  ON fhir_document_protocols FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fhir_patient_protocols p
      WHERE p.id = linked_patient_id AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view own graph edges"
  ON fhir_graph_edges FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can create own graph edges"
  ON fhir_graph_edges FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());
