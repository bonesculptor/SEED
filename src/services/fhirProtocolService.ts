import { supabase } from '../lib/supabase';

export interface FHIRPatientProtocol {
  id?: string;
  protocol_id: string;
  version: string;
  active: boolean;
  patient_identifier: any[];
  given_name: string;
  family_name: string;
  birth_date: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  telecom?: any[];
  address?: any[];
  marital_status?: string;
  language?: any[];
  contact?: any[];
  general_practitioner?: any[];
  managing_organization?: string;
  consent_flags?: any;
  metadata?: any;
}

export interface FHIRPractitionerProtocol {
  id?: string;
  protocol_id: string;
  version: string;
  active: boolean;
  practitioner_identifier: any[];
  given_name: string;
  family_name: string;
  qualification?: any[];
  specialty?: any[];
  telecom?: any[];
  address?: any[];
  organization_ref?: string;
  linked_patient_id?: string;
  metadata?: any;
}

export interface FHIREncounterProtocol {
  id?: string;
  protocol_id: string;
  version: string;
  status: 'planned' | 'arrived' | 'in-progress' | 'finished' | 'cancelled';
  class_code: string;
  encounter_type?: any[];
  period_start: string;
  period_end?: string;
  service_type?: string;
  priority?: string;
  participant?: any[];
  location?: any[];
  reason_code?: any[];
  reason_reference?: any[];
  diagnosis?: any[];
  linked_patient_id: string;
  linked_practitioner_id?: string;
  metadata?: any;
}

export interface FHIRConditionProtocol {
  id?: string;
  protocol_id: string;
  version: string;
  clinical_status: 'active' | 'recurrence' | 'relapse' | 'inactive' | 'remission' | 'resolved';
  verification_status: 'unconfirmed' | 'provisional' | 'differential' | 'confirmed' | 'refuted' | 'entered-in-error';
  category?: any[];
  severity?: string;
  code: any;
  body_site?: any[];
  onset_datetime?: string;
  abatement_datetime?: string;
  recorded_date?: string;
  stage?: any;
  evidence?: any[];
  note?: string;
  linked_patient_id: string;
  linked_encounter_id?: string;
  metadata?: any;
}

export interface FHIRMedicationProtocol {
  id?: string;
  protocol_id: string;
  version: string;
  status: 'active' | 'completed' | 'entered-in-error' | 'intended' | 'stopped' | 'on-hold';
  medication_code: any;
  medication_text: string;
  dosage?: any[];
  effective_datetime?: string;
  effective_period?: any;
  date_asserted?: string;
  reason_code?: any[];
  reason_reference?: any[];
  note?: string;
  linked_patient_id: string;
  linked_encounter_id?: string;
  linked_condition_id?: string;
  metadata?: any;
}

export interface FHIRObservationProtocol {
  id?: string;
  protocol_id: string;
  version: string;
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error';
  category?: any[];
  code: any;
  effective_datetime: string;
  issued?: string;
  value_quantity?: any;
  value_string?: string;
  value_boolean?: boolean;
  value_integer?: number;
  value_range?: any;
  value_ratio?: any;
  value_codeable_concept?: any;
  interpretation?: any[];
  reference_range?: any[];
  body_site?: any;
  method?: any;
  note?: string;
  linked_patient_id: string;
  linked_encounter_id?: string;
  linked_condition_id?: string;
  metadata?: any;
}

export interface FHIRProcedureProtocol {
  id?: string;
  protocol_id: string;
  version: string;
  status: 'preparation' | 'in-progress' | 'not-done' | 'on-hold' | 'stopped' | 'completed' | 'entered-in-error' | 'unknown';
  category?: any;
  code: any;
  performed_datetime?: string;
  performed_period?: any;
  reason_code?: any[];
  reason_reference?: any[];
  body_site?: any[];
  outcome?: any;
  report?: any[];
  complication?: any[];
  follow_up?: any[];
  note?: string;
  linked_patient_id: string;
  linked_encounter_id?: string;
  linked_condition_id?: string;
  metadata?: any;
}

export interface FHIRDocumentProtocol {
  id?: string;
  protocol_id: string;
  version: string;
  status: 'current' | 'superseded' | 'entered-in-error';
  doc_type: any;
  category?: any[];
  description?: string;
  content: any;
  date?: string;
  security_label?: any[];
  context?: any;
  linked_patient_id: string;
  linked_encounter_id?: string;
  linked_practitioner_id?: string;
  metadata?: any;
}

export interface FHIRGraphEdge {
  id?: string;
  source_protocol_type: string;
  source_protocol_id: string;
  target_protocol_type: string;
  target_protocol_id: string;
  relationship_type: string;
  properties?: any;
}

class FHIRProtocolService {
  // Patient Protocols
  async createPatient(patient: Omit<FHIRPatientProtocol, 'id'>): Promise<FHIRPatientProtocol> {
    const { data, error } = await supabase
      .from('fhir_patient_protocols')
      .insert([patient])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPatients(): Promise<FHIRPatientProtocol[]> {
    const { data, error } = await supabase
      .from('fhir_patient_protocols')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getPatientById(id: string): Promise<FHIRPatientProtocol | null> {
    const { data, error } = await supabase
      .from('fhir_patient_protocols')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Practitioner Protocols
  async createPractitioner(practitioner: Omit<FHIRPractitionerProtocol, 'id'>): Promise<FHIRPractitionerProtocol> {
    const { data, error } = await supabase
      .from('fhir_practitioner_protocols')
      .insert([practitioner])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPractitioners(patientId?: string): Promise<FHIRPractitionerProtocol[]> {
    let query = supabase
      .from('fhir_practitioner_protocols')
      .select('*');

    if (patientId) {
      query = query.eq('linked_patient_id', patientId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Encounter Protocols
  async createEncounter(encounter: Omit<FHIREncounterProtocol, 'id'>): Promise<FHIREncounterProtocol> {
    const { data, error } = await supabase
      .from('fhir_encounter_protocols')
      .insert([encounter])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getEncounters(patientId?: string): Promise<FHIREncounterProtocol[]> {
    let query = supabase
      .from('fhir_encounter_protocols')
      .select('*');

    if (patientId) {
      query = query.eq('linked_patient_id', patientId);
    }

    const { data, error } = await query.order('period_start', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Condition Protocols
  async createCondition(condition: Omit<FHIRConditionProtocol, 'id'>): Promise<FHIRConditionProtocol> {
    const { data, error } = await supabase
      .from('fhir_condition_protocols')
      .insert([condition])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getConditions(patientId?: string): Promise<FHIRConditionProtocol[]> {
    let query = supabase
      .from('fhir_condition_protocols')
      .select('*');

    if (patientId) {
      query = query.eq('linked_patient_id', patientId);
    }

    const { data, error } = await query.order('recorded_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Medication Protocols
  async createMedication(medication: Omit<FHIRMedicationProtocol, 'id'>): Promise<FHIRMedicationProtocol> {
    const { data, error } = await supabase
      .from('fhir_medication_protocols')
      .insert([medication])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMedications(patientId?: string): Promise<FHIRMedicationProtocol[]> {
    let query = supabase
      .from('fhir_medication_protocols')
      .select('*');

    if (patientId) {
      query = query.eq('linked_patient_id', patientId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Observation Protocols
  async createObservation(observation: Omit<FHIRObservationProtocol, 'id'>): Promise<FHIRObservationProtocol> {
    const { data, error } = await supabase
      .from('fhir_observation_protocols')
      .insert([observation])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getObservations(patientId?: string): Promise<FHIRObservationProtocol[]> {
    let query = supabase
      .from('fhir_observation_protocols')
      .select('*');

    if (patientId) {
      query = query.eq('linked_patient_id', patientId);
    }

    const { data, error } = await query.order('effective_datetime', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Procedure Protocols
  async createProcedure(procedure: Omit<FHIRProcedureProtocol, 'id'>): Promise<FHIRProcedureProtocol> {
    const { data, error } = await supabase
      .from('fhir_procedure_protocols')
      .insert([procedure])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProcedures(patientId?: string): Promise<FHIRProcedureProtocol[]> {
    let query = supabase
      .from('fhir_procedure_protocols')
      .select('*');

    if (patientId) {
      query = query.eq('linked_patient_id', patientId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Document Protocols
  async createDocument(document: Omit<FHIRDocumentProtocol, 'id'>): Promise<FHIRDocumentProtocol> {
    const { data, error } = await supabase
      .from('fhir_document_protocols')
      .insert([document])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDocuments(patientId?: string): Promise<FHIRDocumentProtocol[]> {
    let query = supabase
      .from('fhir_document_protocols')
      .select('*');

    if (patientId) {
      query = query.eq('linked_patient_id', patientId);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Graph Edges
  async createGraphEdge(edge: Omit<FHIRGraphEdge, 'id'>): Promise<FHIRGraphEdge> {
    const { data, error } = await supabase
      .from('fhir_graph_edges')
      .insert([edge])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getGraphEdges(): Promise<FHIRGraphEdge[]> {
    const { data, error } = await supabase
      .from('fhir_graph_edges')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  async getGraphForPatient(patientId: string): Promise<{ nodes: any[]; edges: FHIRGraphEdge[] }> {
    const [
      patients,
      practitioners,
      encounters,
      conditions,
      medications,
      observations,
      procedures,
      documents,
      edges
    ] = await Promise.all([
      this.getPatientById(patientId),
      this.getPractitioners(patientId),
      this.getEncounters(patientId),
      this.getConditions(patientId),
      this.getMedications(patientId),
      this.getObservations(patientId),
      this.getProcedures(patientId),
      this.getDocuments(patientId),
      this.getGraphEdges()
    ]);

    const nodes = [];

    if (patients) {
      nodes.push({ ...patients, type: 'patient', level: 1 });
    }

    practitioners.forEach(p => nodes.push({ ...p, type: 'practitioner', level: 2 }));
    encounters.forEach(e => nodes.push({ ...e, type: 'encounter', level: 3 }));
    conditions.forEach(c => nodes.push({ ...c, type: 'condition', level: 4 }));
    medications.forEach(m => nodes.push({ ...m, type: 'medication', level: 5 }));
    observations.forEach(o => nodes.push({ ...o, type: 'observation', level: 6 }));
    procedures.forEach(p => nodes.push({ ...p, type: 'procedure', level: 7 }));
    documents.forEach(d => nodes.push({ ...d, type: 'document', level: 8 }));

    return { nodes, edges };
  }
}

export const fhirProtocolService = new FHIRProtocolService();
