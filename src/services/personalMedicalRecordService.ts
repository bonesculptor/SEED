import { supabase } from '../lib/supabase';

type RecordType = 'patient' | 'practitioner' | 'encounter' | 'condition' | 'medication' | 'procedure' | 'observation' | 'document';

interface MedicalRecord {
  id: string;
  user_id: string;
  type: RecordType;
  title: string;
  summary: string;
  data: any;
  metadata: any;
  created_at: string;
  updated_at: string;
}

class PersonalMedicalRecordService {
  private getTableName(type: RecordType): string {
    const tableMap = {
      patient: 'fhir_patient_protocols',
      practitioner: 'fhir_practitioner_protocols',
      encounter: 'fhir_encounter_protocols',
      condition: 'fhir_condition_protocols',
      medication: 'fhir_medication_protocols',
      procedure: 'fhir_procedure_protocols',
      observation: 'fhir_observation_protocols',
      document: 'document_files'
    };
    return tableMap[type];
  }

  async getRecordsByType(type: RecordType): Promise<MedicalRecord[]> {
    const tableName = this.getTableName(type);

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (type === 'document' && data) {
      return data.map(doc => ({
        id: doc.id,
        user_id: '',
        type: 'document' as RecordType,
        title: doc.filename || 'Document',
        summary: this.formatDocumentSummary(doc),
        data: doc,
        metadata: doc.metadata || {},
        created_at: doc.uploaded_at || doc.created_at,
        updated_at: doc.uploaded_at || doc.created_at
      }));
    }

    return data || [];
  }

  private formatDocumentSummary(doc: any): string {
    const metadata = doc.metadata || {};
    const size = doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'Unknown size';
    const extracted = metadata.extracted ? '✓ Extracted' : 'Not extracted';
    const recordCount = metadata.recordCount ? ` (${metadata.recordCount} records)` : '';
    const did = metadata.did ? ` | DID: ${metadata.did.substring(0, 20)}...` : '';
    return `${size} | ${extracted}${recordCount}${did}`;
  }

  async getRecordById(type: RecordType, id: string): Promise<MedicalRecord | null> {
    const tableName = this.getTableName(type);

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createRecord(type: RecordType, recordData: any): Promise<MedicalRecord> {
    const tableName = this.getTableName(type);

    const title = this.generateTitle(type, recordData);
    const summary = this.generateSummary(type, recordData);

    const record = {
      type,
      title,
      summary,
      data: recordData,
      metadata: {
        source: 'manual_entry',
        created_by: 'user'
      }
    };

    const { data, error } = await supabase
      .from(tableName)
      .insert([record])
      .select()
      .single();

    if (error) throw error;

    await this.createGraphEdges(type, data.id, recordData);

    return data;
  }

  async updateRecord(type: RecordType, id: string, recordData: any): Promise<MedicalRecord> {
    const tableName = this.getTableName(type);

    const title = this.generateTitle(type, recordData);
    const summary = this.generateSummary(type, recordData);

    const update = {
      title,
      summary,
      data: recordData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(tableName)
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await this.updateGraphEdges(type, id, recordData);

    return data;
  }

  async deleteRecord(type: RecordType, id: string): Promise<void> {
    const tableName = this.getTableName(type);

    await supabase
      .from('fhir_graph_edges')
      .delete()
      .or(`source_id.eq.${id},target_id.eq.${id}`);

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private generateTitle(type: RecordType, data: any): string {
    switch (type) {
      case 'patient':
        return data.name || 'Patient Record';
      case 'practitioner':
        return `Dr. ${data.name || 'Unknown'} - ${data.specialty || 'Practitioner'}`;
      case 'encounter':
        return `${data.type || 'Visit'} - ${data.date || 'Date Unknown'}`;
      case 'condition':
        return data.name || 'Medical Condition';
      case 'medication':
        return `${data.name || 'Medication'} ${data.dosage || ''}`;
      case 'procedure':
        return data.name || 'Medical Procedure';
      case 'observation':
        return `${data.type || 'Observation'}: ${data.value || ''} ${data.unit || ''}`;
      case 'document':
        return data.title || 'Medical Document';
      default:
        return 'Medical Record';
    }
  }

  private generateSummary(type: RecordType, data: any): string {
    switch (type) {
      case 'patient':
        return `DOB: ${data.birthDate || 'Unknown'}, NHS: ${data.nhsNumber || 'N/A'}`;
      case 'practitioner':
        return `${data.specialty || 'Specialist'} at ${data.organization || 'Unknown'}`;
      case 'encounter':
        return `${data.reason || 'Medical visit'} at ${data.location || 'Unknown location'}`;
      case 'condition':
        return `Status: ${data.clinicalStatus || 'Unknown'}, Severity: ${data.severity || 'Unknown'}`;
      case 'medication':
        return `${data.dosage || ''} ${data.frequency || ''} - ${data.route || 'Oral'}`;
      case 'procedure':
        return `Performed by ${data.performer || 'Unknown'} on ${data.date || 'Unknown date'}`;
      case 'observation':
        return `Recorded on ${data.date || 'Unknown date'}`;
      case 'document':
        return `${data.type || 'Document'} by ${data.author || 'Unknown'}`;
      default:
        return 'Medical record';
    }
  }

  private async createGraphEdges(type: RecordType, recordId: string, data: any): Promise<void> {
    const edges: any[] = [];

    if (type === 'encounter' && data.practitioner) {
      edges.push({
        source_type: 'encounter',
        source_id: recordId,
        target_type: 'practitioner',
        target_id: data.practitioner,
        relationship_type: 'treated_by',
        metadata: { date: data.date }
      });
    }

    if (type === 'condition' && data.encounter) {
      edges.push({
        source_type: 'condition',
        source_id: recordId,
        target_type: 'encounter',
        target_id: data.encounter,
        relationship_type: 'diagnosed_during',
        metadata: { date: data.onsetDate }
      });
    }

    if (type === 'medication' && data.condition) {
      edges.push({
        source_type: 'medication',
        source_id: recordId,
        target_type: 'condition',
        target_id: data.condition,
        relationship_type: 'treats',
        metadata: { startDate: data.startDate }
      });
    }

    if (type === 'procedure' && data.encounter) {
      edges.push({
        source_type: 'procedure',
        source_id: recordId,
        target_type: 'encounter',
        target_id: data.encounter,
        relationship_type: 'performed_during',
        metadata: { date: data.date }
      });
    }

    if (edges.length > 0) {
      await supabase.from('fhir_graph_edges').insert(edges);
    }
  }

  private async updateGraphEdges(type: RecordType, recordId: string, data: any): Promise<void> {
    await supabase
      .from('fhir_graph_edges')
      .delete()
      .eq('source_id', recordId);

    await this.createGraphEdges(type, recordId, data);
  }

  async getGraphData(): Promise<{ nodes: any[]; edges: any[] }> {
    const nodes: any[] = [];
    const edges: any[] = [];

    const types: RecordType[] = ['patient', 'practitioner', 'encounter', 'condition', 'medication', 'procedure', 'observation', 'document'];

    for (const type of types) {
      const records = await this.getRecordsByType(type);
      nodes.push(...records.map(r => ({
        id: r.id,
        type,
        label: r.title,
        data: r.data,
        level: this.getProtocolLevel(type)
      })));
    }

    const { data: graphEdges } = await supabase
      .from('fhir_graph_edges')
      .select('*');

    if (graphEdges) {
      edges.push(...graphEdges.map(e => ({
        source: e.source_id,
        target: e.target_id,
        type: e.relationship_type,
        metadata: e.metadata
      })));
    }

    return { nodes, edges };
  }

  private getProtocolLevel(type: RecordType): number {
    const levelMap = {
      patient: 1,
      practitioner: 2,
      encounter: 3,
      condition: 4,
      medication: 5,
      procedure: 6,
      observation: 7,
      document: 8
    };
    return levelMap[type] || 0;
  }

  async importFromDocument(documentText: string, patientName: string): Promise<void> {
    console.log('Importing medical records for:', patientName);
  }
}

export const personalMedicalRecordService = new PersonalMedicalRecordService();
