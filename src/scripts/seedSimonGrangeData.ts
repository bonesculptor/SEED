import { supabase } from '../lib/supabase';

export async function seedSimonGrangeData() {
  console.log('🔄 Starting to seed Simon Grange medical records...');

  try {
    console.log('🧹 Step 0: Clearing ALL existing data...');
    const tables = [
      'fhir_graph_edges',
      'fhir_document_protocols',
      'fhir_observation_protocols',
      'fhir_procedure_protocols',
      'fhir_medication_protocols',
      'fhir_condition_protocols',
      'fhir_encounter_protocols',
      'fhir_practitioner_protocols',
      'fhir_patient_protocols'
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) console.error(`Error clearing ${table}:`, error);
    }
    console.log('✅ Cleared all existing data');

    console.log('📝 Step 1: Creating patient record...');
    const patientData = {
      type: 'patient',
      title: 'Simon Andre Welham Grange',
      given_name: 'Simon',
      family_name: 'Grange',
      summary: 'DOB: 6/7/1966, NHS: 450 437 4846',
      data: {
        name: 'Simon Andre Welham Grange',
        preferredName: 'Simon Grange',
        birthDate: '1966-07-06',
        gender: 'Male',
        nhsNumber: '450 437 4846',
        hospitalNumber: '39776265',
        phone: '07783 011919',
        address: '82 Collinswood Drive, St. Leonards-on-Sea, East Sussex, TN38 0NX',
        occupation: 'Orthopaedic Surgeon'
      },
      metadata: {
        source: 'nhs_letter',
        imported_date: new Date().toISOString()
      }
    };

    const { data: patient, error: patientError } = await supabase
      .from('fhir_patient_protocols')
      .insert([patientData])
      .select()
      .single();

    if (patientError) {
      console.error('❌ Patient error:', patientError);
      throw new Error(`Failed to create patient: ${patientError.message}`);
    }
    console.log('✅ Patient record created:', patient.id);

    const practitioners = [
      {
        type: 'practitioner',
        title: 'Dr. Mohammad Salman - Cardiac Surgery',
        given_name: 'Mohammad',
        family_name: 'Salman',
        summary: 'SpR in Cardiac Surgery at St Thomas\' Hospital',
        data: {
          name: 'Mohammad Salman',
          specialty: 'Cardiac Surgery',
          title: 'SpR in Cardiac Surgery',
          organization: 'St Thomas\' Hospital',
          department: 'Cardiac Surgery General',
          contact: '02071881077/1057',
          email: 'tr.CardiacSurgeryAppointments@nhs.net'
        },
        metadata: { source: 'nhs_letter' }
      },
      {
        type: 'practitioner',
        title: 'Dr. Shahram AhmadVizir - Cardiology',
        given_name: 'Shahram',
        family_name: 'AhmadVizir',
        summary: 'Consultant Cardiologist at Conquest Hospital',
        data: {
          name: 'Shahram AhmadVizir',
          specialty: 'Cardiology',
          title: 'Consultant Cardiologist',
          organization: 'Conquest Hospital',
          address: 'The Ridge, Hastings, Saint Leonards-on-sea, TN37 7RD'
        },
        metadata: { source: 'nhs_letter' }
      },
      {
        type: 'practitioner',
        title: 'Mr. Sabetai - Cardiac Surgery',
        given_name: 'Sabetai',
        family_name: 'Sabetai',
        summary: 'Cardiac Surgeon at St Thomas\' Hospital',
        data: {
          name: 'Sabetai',
          specialty: 'Cardiac Surgery',
          title: 'Mr.',
          organization: 'St Thomas\' Hospital',
          role: 'Performed CABG x3 procedure'
        },
        metadata: { source: 'nhs_letter' }
      }
    ];

    console.log('📝 Step 2: Creating practitioner records...');
    const { data: practitionerRecords, error: practitionerError } = await supabase
      .from('fhir_practitioner_protocols')
      .insert(practitioners)
      .select();

    if (practitionerError) {
      console.error('❌ Practitioner error:', practitionerError);
      throw new Error(`Failed to create practitioners: ${practitionerError.message}`);
    }
    console.log('✅ Practitioner records created:', practitionerRecords.length);

    const encounters = [
      {
        type: 'encounter',
        title: 'Emergency Transfer - 31/12/2024',
        summary: 'Transfer from Conquest Hospital to St Thomas\' with crushing chest pain',
        data: {
          type: 'Emergency Admission',
          date: '2024-12-31',
          location: 'St Thomas\' Hospital, London',
          transferFrom: 'Conquest Hospital',
          practitioner: practitionerRecords[0].id,
          reason: 'Crushing chest pain radiating to arms, shoulders, and jaw with troponin rise from 66 to 350',
          status: 'Completed'
        },
        metadata: { source: 'nhs_letter' }
      },
      {
        type: 'encounter',
        title: 'Angiogram - 01/01/2025',
        summary: 'Diagnostic angiogram demonstrating triple vessel disease',
        data: {
          type: 'Diagnostic Procedure',
          date: '2025-01-01',
          location: 'St Thomas\' Hospital',
          practitioner: practitionerRecords[2].id,
          reason: 'Diagnostic assessment for coronary artery disease',
          findings: 'Triple vessel disease demonstrated',
          status: 'Completed'
        },
        metadata: { source: 'nhs_letter' }
      },
      {
        type: 'encounter',
        title: 'CABG Surgery - 08/01/2025',
        summary: 'Urgent coronary artery bypass graft surgery',
        data: {
          type: 'Surgical Procedure',
          date: '2025-01-08',
          location: 'St Thomas\' Hospital',
          practitioner: practitionerRecords[2].id,
          reason: 'Triple vessel coronary artery disease requiring surgical intervention',
          surgeon: 'Mr. Sabetai',
          status: 'Completed'
        },
        metadata: { source: 'nhs_letter' }
      },
      {
        type: 'encounter',
        title: 'Follow-up Appointment - 24/02/2025',
        summary: 'Post-operative follow-up in telephone clinic',
        data: {
          type: 'Follow-up Visit',
          date: '2025-02-24',
          location: 'St Thomas\' Hospital (Telephone Clinic)',
          practitioner: practitionerRecords[0].id,
          reason: 'Post-operative assessment and medication review',
          status: 'Completed'
        },
        metadata: { source: 'nhs_letter' }
      }
    ];

    const { data: encounterRecords, error: encounterError } = await supabase
      .from('fhir_encounter_protocols')
      .insert(encounters)
      .select();

    if (encounterError) throw encounterError;
    console.log('✓ Encounter records created:', encounterRecords.length);

    const conditions = [
      {
        type: 'condition',
        title: 'Triple Vessel Coronary Artery Disease',
        summary: 'Status: Active, Severity: Severe',
        data: {
          name: 'Triple Vessel Coronary Artery Disease',
          clinicalStatus: 'Active',
          severity: 'Severe',
          onsetDate: '2024-12-31',
          diagnosisDate: '2025-01-01',
          notes: 'Demonstrated on angiogram 01/01/25. Required urgent CABG x3 intervention.',
          snomedCode: '53741008'
        },
        metadata: { source: 'nhs_letter', encounter: encounterRecords[1].id }
      },
      {
        type: 'condition',
        title: 'Acute Chest Pain',
        summary: 'Status: Resolved, Severity: Severe',
        data: {
          name: 'Crushing chest pain radiating to arms, shoulders, and jaw',
          clinicalStatus: 'Resolved',
          severity: 'Severe',
          onsetDate: '2024-12-31',
          resolvedDate: '2025-01-08',
          notes: 'Accompanied by troponin rise from 66 to 350. ECG showed T-wave inversion laterally.',
          snomedCode: '29857009'
        },
        metadata: { source: 'nhs_letter', encounter: encounterRecords[0].id }
      },
      {
        type: 'condition',
        title: 'Post-operative Chest Infection',
        summary: 'Status: Resolved, Severity: Moderate',
        data: {
          name: 'Post-operative chest infection',
          clinicalStatus: 'Resolved',
          severity: 'Moderate',
          onsetDate: '2025-01-10',
          resolvedDate: '2025-01-20',
          notes: 'Treated with antibiotics. Recovery was uneventful.',
          treatment: 'Antibiotics'
        },
        metadata: { source: 'nhs_letter', encounter: encounterRecords[2].id }
      },
      {
        type: 'condition',
        title: 'Sternum Pain and Limited Range/Power',
        summary: 'Status: Active, Severity: Moderate',
        data: {
          name: 'Post-operative sternum discomfort with limited range and power',
          clinicalStatus: 'Active',
          severity: 'Moderate',
          onsetDate: '2025-01-08',
          notes: 'Wounds have healed and sternum remains stable. Patient continues to experience discomfort and soreness affecting range and power.',
          impactOnOccupation: 'Advised to refrain from returning to work as orthopaedic surgeon until fully completed rehabilitation'
        },
        metadata: { source: 'nhs_letter', encounter: encounterRecords[3].id }
      }
    ];

    const { data: conditionRecords, error: conditionError } = await supabase
      .from('fhir_condition_protocols')
      .insert(conditions)
      .select();

    if (conditionError) throw conditionError;
    console.log('✓ Condition records created:', conditionRecords.length);

    const medications = [
      {
        type: 'medication',
        title: 'Amlodipine 10mg OD',
        summary: '10mg OD - Oral',
        data: {
          name: 'Amlodipine',
          dosage: '10mg',
          frequency: 'OD (Once Daily)',
          route: 'Oral',
          startDate: '2025-01-08',
          prescriber: 'Dr. Mohammad Salman',
          indication: 'Hypertension management post-CABG',
          rxNormCode: '197361'
        },
        metadata: { source: 'nhs_letter' }
      },
      {
        type: 'medication',
        title: 'Aspirin 75mg OD',
        summary: '75mg OD - Oral',
        data: {
          name: 'Aspirin',
          dosage: '75mg',
          frequency: 'OD (Once Daily)',
          route: 'Oral',
          startDate: '2025-01-08',
          prescriber: 'Dr. Mohammad Salman',
          indication: 'Antiplatelet therapy post-CABG',
          rxNormCode: '1191'
        },
        metadata: { source: 'nhs_letter' }
      },
      {
        type: 'medication',
        title: 'Atorvastatin 80mg OD',
        summary: '80mg OD - Oral',
        data: {
          name: 'Atorvastatin',
          dosage: '80mg',
          frequency: 'OD (Once Daily)',
          route: 'Oral',
          startDate: '2025-01-08',
          prescriber: 'Dr. Mohammad Salman',
          indication: 'Lipid management in coronary artery disease',
          rxNormCode: '83367'
        },
        metadata: { source: 'nhs_letter' }
      },
      {
        type: 'medication',
        title: 'Bisoprolol 3.75mg AM and 2.5mg PM',
        summary: '3.75mg AM, 2.5mg PM - Oral',
        data: {
          name: 'Bisoprolol',
          dosage: '3.75mg AM and 2.5mg PM',
          frequency: 'BD (Twice Daily)',
          route: 'Oral',
          startDate: '2025-01-08',
          prescriber: 'Dr. Mohammad Salman',
          indication: 'Beta-blocker for cardiac protection post-CABG',
          rxNormCode: '19484'
        },
        metadata: { source: 'nhs_letter' }
      },
      {
        type: 'medication',
        title: 'Clopidogrel 75mg OD',
        summary: '75mg OD - Oral',
        data: {
          name: 'Clopidogrel',
          dosage: '75mg',
          frequency: 'OD (Once Daily)',
          route: 'Oral',
          startDate: '2025-01-08',
          endDate: '2026-01-08',
          prescriber: 'Dr. Mohammad Salman',
          indication: 'Antiplatelet therapy for vein graft (one year duration)',
          duration: '1 year',
          notes: 'To be stopped after one year',
          rxNormCode: '32968'
        },
        metadata: { source: 'nhs_letter' }
      },
      {
        type: 'medication',
        title: 'Pantoprazole 40mg OD',
        summary: '40mg OD - Oral',
        data: {
          name: 'Pantoprazole',
          dosage: '40mg',
          frequency: 'OD (Once Daily)',
          route: 'Oral',
          startDate: '2025-01-08',
          endDate: '2026-01-08',
          prescriber: 'Dr. Mohammad Salman',
          indication: 'Gastroprotection with dual antiplatelet therapy',
          duration: '1 year',
          notes: 'Can be stopped after Clopidogrel is ceased',
          rxNormCode: '40790'
        },
        metadata: { source: 'nhs_letter' }
      },
      {
        type: 'medication',
        title: 'Ramipril 1.25mg OD',
        summary: '1.25mg OD - Oral',
        data: {
          name: 'Ramipril',
          dosage: '1.25mg',
          frequency: 'OD (Once Daily)',
          route: 'Oral',
          startDate: '2025-01-08',
          prescriber: 'Dr. Mohammad Salman',
          indication: 'ACE inhibitor for cardioprotection post-CABG',
          notes: 'May be up-titrated accordingly',
          rxNormCode: '35296'
        },
        metadata: { source: 'nhs_letter' }
      }
    ];

    const { data: medicationRecords, error: medicationError } = await supabase
      .from('fhir_medication_protocols')
      .insert(medications)
      .select();

    if (medicationError) throw medicationError;
    console.log('✓ Medication records created:', medicationRecords.length);

    const procedures = [
      {
        type: 'procedure',
        title: 'Coronary Angiogram',
        summary: 'Performed on 01/01/2025',
        data: {
          name: 'Coronary Angiogram',
          date: '2025-01-01',
          performer: 'Cardiac Catheterization Team',
          location: 'St Thomas\' Hospital - Cardiac Catheterization Lab',
          outcome: 'Triple vessel disease demonstrated',
          findings: 'Significant stenosis in multiple coronary vessels requiring surgical intervention',
          cptCode: '93458'
        },
        metadata: { source: 'nhs_letter', encounter: encounterRecords[1].id }
      },
      {
        type: 'procedure',
        title: 'CABG x3 (Triple Bypass)',
        summary: 'Performed by Mr. Sabetai on 08/01/2025',
        data: {
          name: 'Coronary Artery Bypass Graft x3 (CABG x3)',
          date: '2025-01-08',
          performer: 'Mr. Sabetai',
          location: 'St Thomas\' Hospital - Cardiac Surgery Theatre',
          outcome: 'Successful revascularization with three grafts',
          notes: `Procedure involved:
- LIMA → mid LAD (2.5mm, excellent target)
- Left Radial → OM2 (2.5mm, excellent target)
- Left Long Saphenous Vein → distal RCA (1.5mm, very small, excellent run-off)`,
          grafts: [
            {
              type: 'LIMA',
              source: 'Left Internal Mammary Artery',
              target: 'mid LAD',
              diameter: '2.5mm',
              quality: 'excellent target'
            },
            {
              type: 'Arterial',
              source: 'Left Radial',
              target: 'OM2',
              diameter: '2.5mm',
              quality: 'excellent target'
            },
            {
              type: 'Venous',
              source: 'Left Long Saphenous Vein',
              target: 'distal RCA',
              diameter: '1.5mm',
              quality: 'very small, excellent run-off'
            }
          ],
          complications: 'Post-operative chest infection (treated successfully)',
          cptCode: '33533'
        },
        metadata: { source: 'nhs_letter', encounter: encounterRecords[2].id }
      }
    ];

    const { data: procedureRecords, error: procedureError } = await supabase
      .from('fhir_procedure_protocols')
      .insert(procedures)
      .select();

    if (procedureError) throw procedureError;
    console.log('✓ Procedure records created:', procedureRecords.length);

    const observations = [
      {
        type: 'observation',
        title: 'Troponin Level (31/12/24): 66 ng/L',
        summary: 'Recorded on 2024-12-31',
        data: {
          type: 'Troponin Level',
          value: '66',
          unit: 'ng/L',
          date: '2024-12-31',
          interpretation: 'Elevated',
          notes: 'Initial presentation value',
          loincCode: '6598-7'
        },
        metadata: { source: 'nhs_letter', encounter: encounterRecords[0].id }
      },
      {
        type: 'observation',
        title: 'Troponin Level (Peak): 350 ng/L',
        summary: 'Recorded on 2024-12-31',
        data: {
          type: 'Troponin Level',
          value: '350',
          unit: 'ng/L',
          date: '2024-12-31',
          interpretation: 'Significantly Elevated',
          notes: 'Peak troponin rise indicating significant myocardial injury',
          loincCode: '6598-7'
        },
        metadata: { source: 'nhs_letter', encounter: encounterRecords[0].id }
      },
      {
        type: 'observation',
        title: 'ECG Findings: T-wave inversion laterally',
        summary: 'Recorded on 2024-12-31',
        data: {
          type: 'ECG',
          value: 'T-wave inversion laterally',
          date: '2024-12-31',
          interpretation: 'Abnormal - indicating lateral ischemia',
          notes: 'Lateral T-wave inversion consistent with coronary artery disease',
          loincCode: '11524-6'
        },
        metadata: { source: 'nhs_letter', encounter: encounterRecords[0].id }
      },
      {
        type: 'observation',
        title: 'Post-operative Assessment: Wounds healed',
        summary: 'Recorded on 2025-02-24',
        data: {
          type: 'Wound Assessment',
          value: 'Healed',
          date: '2025-02-24',
          notes: 'All surgical wounds have healed appropriately',
          status: 'Normal'
        },
        metadata: { source: 'nhs_letter', encounter: encounterRecords[3].id }
      },
      {
        type: 'observation',
        title: 'Post-operative Assessment: Sternum stable',
        summary: 'Recorded on 2025-02-24',
        data: {
          type: 'Sternum Stability',
          value: 'Stable',
          date: '2025-02-24',
          notes: 'Sternum remains stable but range and power still limited by pain',
          status: 'Acceptable'
        },
        metadata: { source: 'nhs_letter', encounter: encounterRecords[3].id }
      },
      {
        type: 'observation',
        title: 'Post-operative Progress: Uneventful recovery',
        summary: 'Recorded on 2025-02-24',
        data: {
          type: 'Overall Recovery Assessment',
          value: 'Uneventful',
          date: '2025-02-24',
          notes: 'Patient doing well overall. Satisfactory progress. Discharged back to GP care.',
          status: 'Satisfactory'
        },
        metadata: { source: 'nhs_letter', encounter: encounterRecords[3].id }
      }
    ];

    const { data: observationRecords, error: observationError } = await supabase
      .from('fhir_observation_protocols')
      .insert(observations)
      .select();

    if (observationError) throw observationError;
    console.log('✓ Observation records created:', observationRecords.length);

    const documents = [
      {
        type: 'document',
        title: 'Follow-up Letter from St Thomas\' Hospital',
        summary: 'Letter by Dr. Mohammad Salman dated 03/01/2025',
        data: {
          title: 'Post-CABG Follow-up Letter',
          type: 'Clinical Correspondence',
          date: '2025-03-01',
          author: 'Dr. Mohammad Salman, SpR in Cardiac Surgery',
          recipient: 'CARISBROOKE SURGERY',
          documentDate: '2025-03-01',
          appointmentDate: '2025-02-24',
          description: 'Comprehensive post-operative follow-up letter detailing CABG x3 procedure, recovery progress, current medications, and discharge back to GP care',
          category: 'Discharge Summary'
        },
        metadata: { source: 'nhs_letter', encounter: encounterRecords[3].id }
      }
    ];

    const { data: documentRecords, error: documentError } = await supabase
      .from('fhir_document_protocols')
      .insert(documents)
      .select();

    if (documentError) throw documentError;
    console.log('✓ Document records created:', documentRecords.length);

    const graphEdges = [
      { source_type: 'encounter', source_id: encounterRecords[0].id, target_type: 'practitioner', target_id: practitionerRecords[0].id, relationship_type: 'treated_by', metadata: { date: '2024-12-31' }},
      { source_type: 'encounter', source_id: encounterRecords[1].id, target_type: 'practitioner', target_id: practitionerRecords[2].id, relationship_type: 'performed_by', metadata: { date: '2025-01-01' }},
      { source_type: 'encounter', source_id: encounterRecords[2].id, target_type: 'practitioner', target_id: practitionerRecords[2].id, relationship_type: 'performed_by', metadata: { date: '2025-01-08' }},
      { source_type: 'encounter', source_id: encounterRecords[3].id, target_type: 'practitioner', target_id: practitionerRecords[0].id, relationship_type: 'followed_up_by', metadata: { date: '2025-02-24' }},

      { source_type: 'condition', source_id: conditionRecords[0].id, target_type: 'encounter', target_id: encounterRecords[1].id, relationship_type: 'diagnosed_during', metadata: {}},
      { source_type: 'condition', source_id: conditionRecords[1].id, target_type: 'encounter', target_id: encounterRecords[0].id, relationship_type: 'presented_at', metadata: {}},
      { source_type: 'condition', source_id: conditionRecords[2].id, target_type: 'encounter', target_id: encounterRecords[2].id, relationship_type: 'occurred_after', metadata: {}},
      { source_type: 'condition', source_id: conditionRecords[3].id, target_type: 'encounter', target_id: encounterRecords[3].id, relationship_type: 'assessed_at', metadata: {}},

      { source_type: 'procedure', source_id: procedureRecords[0].id, target_type: 'encounter', target_id: encounterRecords[1].id, relationship_type: 'performed_during', metadata: {}},
      { source_type: 'procedure', source_id: procedureRecords[1].id, target_type: 'encounter', target_id: encounterRecords[2].id, relationship_type: 'performed_during', metadata: {}},
      { source_type: 'procedure', source_id: procedureRecords[1].id, target_type: 'condition', target_id: conditionRecords[0].id, relationship_type: 'treats', metadata: {}},

      ...medicationRecords.map(med => ({
        source_type: 'medication',
        source_id: med.id,
        target_type: 'encounter',
        target_id: encounterRecords[2].id,
        relationship_type: 'prescribed_at',
        metadata: {}
      })),

      ...observationRecords.slice(0, 3).map(obs => ({
        source_type: 'observation',
        source_id: obs.id,
        target_type: 'encounter',
        target_id: encounterRecords[0].id,
        relationship_type: 'recorded_during',
        metadata: {}
      })),

      ...observationRecords.slice(3).map(obs => ({
        source_type: 'observation',
        source_id: obs.id,
        target_type: 'encounter',
        target_id: encounterRecords[3].id,
        relationship_type: 'recorded_during',
        metadata: {}
      })),

      { source_type: 'document', source_id: documentRecords[0].id, target_type: 'encounter', target_id: encounterRecords[3].id, relationship_type: 'documents', metadata: {}}
    ];

    const { error: edgeError } = await supabase
      .from('fhir_graph_edges')
      .insert(graphEdges);

    if (edgeError) throw edgeError;
    console.log('✓ Graph edges created:', graphEdges.length);

    console.log('\n✅ Simon Grange medical records successfully seeded!');
    console.log('\nSummary:');
    console.log(`- Patient: 1`);
    console.log(`- Practitioners: ${practitionerRecords.length}`);
    console.log(`- Encounters: ${encounterRecords.length}`);
    console.log(`- Conditions: ${conditionRecords.length}`);
    console.log(`- Medications: ${medicationRecords.length}`);
    console.log(`- Procedures: ${procedureRecords.length}`);
    console.log(`- Observations: ${observationRecords.length}`);
    console.log(`- Documents: ${documentRecords.length}`);
    console.log(`- Graph Edges: ${graphEdges.length}`);
    console.log(`\nTotal Records: ${1 + practitionerRecords.length + encounterRecords.length + conditionRecords.length + medicationRecords.length + procedureRecords.length + observationRecords.length + documentRecords.length}`);

    return {
      success: true,
      patient,
      practitioners: practitionerRecords,
      encounters: encounterRecords,
      conditions: conditionRecords,
      medications: medicationRecords,
      procedures: procedureRecords,
      observations: observationRecords,
      documents: documentRecords
    };

  } catch (error: any) {
    console.error('❌ Error seeding Simon Grange data:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint
    });
    throw new Error(`Seeding failed: ${error?.message || error}`);
  }
}
