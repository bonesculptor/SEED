import { fhirProtocolService } from '../services/fhirProtocolService';

export async function seedFHIRMedicalRecords(): Promise<void> {
  console.log('Starting FHIR medical record protocol seeding...');

  // Level 1: Create Patient Protocol
  const patient = await fhirProtocolService.createPatient({
    protocol_id: 'patient-001',
    version: '1.0.0',
    active: true,
    patient_identifier: [
      {
        system: 'urn:oid:2.16.840.1.113883.4.1',
        value: '123-45-6789',
        type: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'SS',
            display: 'Social Security Number'
          }]
        }
      }
    ],
    given_name: 'John',
    family_name: 'Smith',
    birth_date: '1980-05-15',
    gender: 'male',
    telecom: [
      {
        system: 'phone',
        value: '+1-555-0123',
        use: 'home'
      },
      {
        system: 'email',
        value: 'john.smith@example.com',
        use: 'home'
      }
    ],
    address: [
      {
        use: 'home',
        line: ['123 Main Street'],
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'USA'
      }
    ],
    marital_status: 'married',
    language: [
      {
        coding: [{
          system: 'urn:ietf:bcp:47',
          code: 'en-US',
          display: 'English (United States)'
        }]
      }
    ],
    contact: [
      {
        relationship: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
            code: 'C',
            display: 'Emergency Contact'
          }]
        }],
        name: {
          family: 'Smith',
          given: ['Jane']
        },
        telecom: [{
          system: 'phone',
          value: '+1-555-0124'
        }]
      }
    ],
    consent_flags: {
      share_with_family: true,
      share_with_researchers: false
    },
    metadata: {
      created_via: 'Personal Health Record System',
      record_source: 'Self-Reported'
    }
  });

  console.log('✓ Created Patient Protocol:', patient.protocol_id);

  // Level 2: Create Practitioner Protocols
  const practitioner1 = await fhirProtocolService.createPractitioner({
    protocol_id: 'practitioner-001',
    version: '1.0.0',
    active: true,
    practitioner_identifier: [
      {
        system: 'http://hl7.org/fhir/sid/us-npi',
        value: '1234567890'
      }
    ],
    given_name: 'Sarah',
    family_name: 'Johnson',
    qualification: [
      {
        code: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
            code: 'MD',
            display: 'Doctor of Medicine'
          }]
        },
        issuer: {
          display: 'State Medical Board'
        }
      }
    ],
    specialty: [
      {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '419192003',
          display: 'Internal Medicine'
        }]
      }
    ],
    telecom: [
      {
        system: 'phone',
        value: '+1-555-0200',
        use: 'work'
      }
    ],
    linked_patient_id: patient.id,
    metadata: {
      role: 'Primary Care Physician'
    }
  });

  console.log('✓ Created Practitioner Protocol:', practitioner1.protocol_id);

  // Level 3: Create Encounter Protocols
  const encounter1 = await fhirProtocolService.createEncounter({
    protocol_id: 'encounter-001',
    version: '1.0.0',
    status: 'finished',
    class_code: 'AMB',
    encounter_type: [
      {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '185349003',
          display: 'Office Visit'
        }]
      }
    ],
    period_start: '2024-01-15T09:00:00Z',
    period_end: '2024-01-15T09:30:00Z',
    service_type: 'General Medicine',
    participant: [
      {
        type: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
            code: 'PPRF',
            display: 'Primary Performer'
          }]
        }],
        individual: {
          reference: `Practitioner/${practitioner1.id}`,
          display: 'Dr. Sarah Johnson'
        }
      }
    ],
    reason_code: [
      {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '47505003',
          display: 'Postoperative follow-up visit'
        }]
      }
    ],
    linked_patient_id: patient.id!,
    linked_practitioner_id: practitioner1.id,
    metadata: {
      facility: 'Springfield General Hospital'
    }
  });

  console.log('✓ Created Encounter Protocol:', encounter1.protocol_id);

  // Level 4: Create Condition Protocols
  const condition1 = await fhirProtocolService.createCondition({
    protocol_id: 'condition-001',
    version: '1.0.0',
    clinical_status: 'active',
    verification_status: 'confirmed',
    category: [
      {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-category',
          code: 'encounter-diagnosis',
          display: 'Encounter Diagnosis'
        }]
      }
    ],
    severity: 'moderate',
    code: {
      coding: [{
        system: 'http://snomed.info/sct',
        code: '73211009',
        display: 'Diabetes mellitus'
      }],
      text: 'Type 2 Diabetes Mellitus'
    },
    onset_datetime: '2022-06-10T00:00:00Z',
    recorded_date: '2024-01-15T09:15:00Z',
    stage: {
      summary: {
        text: 'Well-controlled with medication'
      }
    },
    note: 'Patient managing condition well with diet and medication',
    linked_patient_id: patient.id!,
    linked_encounter_id: encounter1.id,
    metadata: {
      icd10: 'E11.9'
    }
  });

  console.log('✓ Created Condition Protocol:', condition1.protocol_id);

  // Level 5: Create Medication Protocols
  const medication1 = await fhirProtocolService.createMedication({
    protocol_id: 'medication-001',
    version: '1.0.0',
    status: 'active',
    medication_code: {
      coding: [{
        system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
        code: '860975',
        display: 'Metformin hydrochloride 500 MG Oral Tablet'
      }]
    },
    medication_text: 'Metformin 500mg tablets',
    dosage: [
      {
        text: 'Take one tablet twice daily with meals',
        timing: {
          repeat: {
            frequency: 2,
            period: 1,
            periodUnit: 'd'
          }
        },
        route: {
          coding: [{
            system: 'http://snomed.info/sct',
            code: '26643006',
            display: 'Oral route'
          }]
        },
        doseAndRate: [{
          doseQuantity: {
            value: 500,
            unit: 'mg',
            system: 'http://unitsofmeasure.org',
            code: 'mg'
          }
        }]
      }
    ],
    effective_datetime: '2024-01-15T00:00:00Z',
    reason_code: [
      {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '73211009',
          display: 'Diabetes mellitus'
        }]
      }
    ],
    linked_patient_id: patient.id!,
    linked_encounter_id: encounter1.id,
    linked_condition_id: condition1.id,
    metadata: {
      prescriber: 'Dr. Sarah Johnson',
      pharmacy: 'Springfield Pharmacy'
    }
  });

  console.log('✓ Created Medication Protocol:', medication1.protocol_id);

  // Level 6: Create Observation Protocols
  const observation1 = await fhirProtocolService.createObservation({
    protocol_id: 'observation-001',
    version: '1.0.0',
    status: 'final',
    category: [
      {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'laboratory',
          display: 'Laboratory'
        }]
      }
    ],
    code: {
      coding: [{
        system: 'http://loinc.org',
        code: '4548-4',
        display: 'Hemoglobin A1c/Hemoglobin.total in Blood'
      }],
      text: 'HbA1c'
    },
    effective_datetime: '2024-01-15T08:00:00Z',
    value_quantity: {
      value: 6.5,
      unit: '%',
      system: 'http://unitsofmeasure.org',
      code: '%'
    },
    interpretation: [
      {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
          code: 'N',
          display: 'Normal'
        }]
      }
    ],
    reference_range: [
      {
        low: {
          value: 4.0,
          unit: '%'
        },
        high: {
          value: 5.6,
          unit: '%'
        },
        text: 'Normal: 4.0-5.6%'
      }
    ],
    note: 'Good glycemic control',
    linked_patient_id: patient.id!,
    linked_encounter_id: encounter1.id,
    linked_condition_id: condition1.id,
    metadata: {
      laboratory: 'Springfield Lab',
      performer: 'Lab Technician #12'
    }
  });

  console.log('✓ Created Observation Protocol:', observation1.protocol_id);

  // Level 7: Create Procedure Protocols
  const procedure1 = await fhirProtocolService.createProcedure({
    protocol_id: 'procedure-001',
    version: '1.0.0',
    status: 'completed',
    category: {
      coding: [{
        system: 'http://snomed.info/sct',
        code: '103693007',
        display: 'Diagnostic procedure'
      }]
    },
    code: {
      coding: [{
        system: 'http://snomed.info/sct',
        code: '252779005',
        display: 'Fundoscopy'
      }],
      text: 'Diabetic Eye Exam'
    },
    performed_datetime: '2024-01-15T09:20:00Z',
    reason_code: [
      {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '73211009',
          display: 'Diabetes mellitus'
        }]
      }
    ],
    outcome: {
      text: 'No diabetic retinopathy detected'
    },
    note: 'Annual diabetic eye screening - results normal',
    linked_patient_id: patient.id!,
    linked_encounter_id: encounter1.id,
    linked_condition_id: condition1.id,
    metadata: {
      cpt_code: '92250'
    }
  });

  console.log('✓ Created Procedure Protocol:', procedure1.protocol_id);

  // Level 8: Create Document Protocols
  const document1 = await fhirProtocolService.createDocument({
    protocol_id: 'document-001',
    version: '1.0.0',
    status: 'current',
    doc_type: {
      coding: [{
        system: 'http://loinc.org',
        code: '34133-9',
        display: 'Summarization of episode note'
      }]
    },
    category: [
      {
        coding: [{
          system: 'http://hl7.org/fhir/us/core/CodeSystem/us-core-documentreference-category',
          code: 'clinical-note',
          display: 'Clinical Note'
        }]
      }
    ],
    description: 'Follow-up visit clinical note',
    content: [
      {
        attachment: {
          contentType: 'text/plain',
          data: 'Patient continues to manage Type 2 Diabetes well. HbA1c within target range. No complications noted. Continue current medication regimen.',
          title: 'Clinical Note - January 15, 2024'
        }
      }
    ],
    date: '2024-01-15T09:30:00Z',
    linked_patient_id: patient.id!,
    linked_encounter_id: encounter1.id,
    linked_practitioner_id: practitioner1.id,
    metadata: {
      author: 'Dr. Sarah Johnson',
      signed: true
    }
  });

  console.log('✓ Created Document Protocol:', document1.protocol_id);

  // Create Graph Edges to link protocols
  await fhirProtocolService.createGraphEdge({
    source_protocol_type: 'patient',
    source_protocol_id: patient.id!,
    target_protocol_type: 'practitioner',
    target_protocol_id: practitioner1.id!,
    relationship_type: 'has_care_provider',
    properties: { role: 'primary_care' }
  });

  await fhirProtocolService.createGraphEdge({
    source_protocol_type: 'patient',
    source_protocol_id: patient.id!,
    target_protocol_type: 'encounter',
    target_protocol_id: encounter1.id!,
    relationship_type: 'had_encounter',
    properties: { date: '2024-01-15' }
  });

  await fhirProtocolService.createGraphEdge({
    source_protocol_type: 'encounter',
    source_protocol_id: encounter1.id!,
    target_protocol_type: 'condition',
    target_protocol_id: condition1.id!,
    relationship_type: 'diagnosed_with',
    properties: { status: 'confirmed' }
  });

  await fhirProtocolService.createGraphEdge({
    source_protocol_type: 'condition',
    source_protocol_id: condition1.id!,
    target_protocol_type: 'medication',
    target_protocol_id: medication1.id!,
    relationship_type: 'treated_with',
    properties: { active: true }
  });

  await fhirProtocolService.createGraphEdge({
    source_protocol_type: 'condition',
    source_protocol_id: condition1.id!,
    target_protocol_type: 'observation',
    target_protocol_id: observation1.id!,
    relationship_type: 'monitored_by',
    properties: { test_type: 'lab' }
  });

  await fhirProtocolService.createGraphEdge({
    source_protocol_type: 'condition',
    source_protocol_id: condition1.id!,
    target_protocol_type: 'procedure',
    target_protocol_id: procedure1.id!,
    relationship_type: 'evaluated_with',
    properties: { procedure_type: 'diagnostic' }
  });

  await fhirProtocolService.createGraphEdge({
    source_protocol_type: 'encounter',
    source_protocol_id: encounter1.id!,
    target_protocol_type: 'document',
    target_protocol_id: document1.id!,
    relationship_type: 'documented_in',
    properties: { document_type: 'clinical_note' }
  });

  console.log('✓ Created graph edges linking all protocols');
  console.log('\n✅ FHIR medical record protocols created successfully!');
  console.log(`\nProtocol Hierarchy Created:
  Level 1: Patient (${patient.protocol_id})
  ├─ Level 2: Practitioner (${practitioner1.protocol_id})
  ├─ Level 3: Encounter (${encounter1.protocol_id})
      ├─ Level 4: Condition (${condition1.protocol_id})
          ├─ Level 5: Medication (${medication1.protocol_id})
          ├─ Level 6: Observation (${observation1.protocol_id})
          └─ Level 7: Procedure (${procedure1.protocol_id})
      └─ Level 8: Document (${document1.protocol_id})`);
}
