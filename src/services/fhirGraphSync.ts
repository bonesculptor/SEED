import { supabase } from '../lib/supabase';

interface FHIRGraphNode {
  id: string;
  type: string;
  level: number;
  data: any;
  metadata?: any;
}

interface FHIRGraphEdge {
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  relationship_type: string;
  metadata?: any;
}

class FHIRGraphSyncService {
  private readonly protocolTables = {
    patient: { table: 'fhir_patient_protocols', level: 1 },
    practitioner: { table: 'fhir_practitioner_protocols', level: 2 },
    encounter: { table: 'fhir_encounter_protocols', level: 3 },
    condition: { table: 'fhir_condition_protocols', level: 4 },
    medication: { table: 'fhir_medication_protocols', level: 5 },
    procedure: { table: 'fhir_procedure_protocols', level: 6 },
    observation: { table: 'fhir_observation_protocols', level: 7 },
    document: { table: 'fhir_document_protocols', level: 8 }
  };

  async syncPatientToProtocols(patientId: string): Promise<void> {
    console.log('Syncing patient records to other protocols...');

    const { data: patient, error: patientError } = await supabase
      .from('fhir_patient_protocols')
      .select('*')
      .eq('id', patientId)
      .maybeSingle();

    if (patientError || !patient) {
      throw new Error('Patient not found');
    }

    const edges: FHIRGraphEdge[] = [];

    for (const [type, config] of Object.entries(this.protocolTables)) {
      if (type === 'patient') continue;

      const { data: records } = await supabase
        .from(config.table)
        .select('*');

      if (records && records.length > 0) {
        records.forEach(record => {
          edges.push({
            source_type: 'patient',
            source_id: patientId,
            target_type: type,
            target_id: record.id,
            relationship_type: 'has_record',
            metadata: {
              sync_date: new Date().toISOString(),
              patient_name: patient.data.name
            }
          });
        });
      }
    }

    if (edges.length > 0) {
      const { error } = await supabase
        .from('fhir_graph_edges')
        .upsert(edges, {
          onConflict: 'source_id,target_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error syncing edges:', error);
      } else {
        console.log(`Synced ${edges.length} edges for patient ${patientId}`);
      }
    }
  }

  async propagatePatientData(patientId: string): Promise<void> {
    const { data: patient } = await supabase
      .from('fhir_patient_protocols')
      .select('*')
      .eq('id', patientId)
      .maybeSingle();

    if (!patient) return;

    const relatedRecords = await this.getRelatedRecords(patientId);

    for (const record of relatedRecords) {
      const updatedMetadata = {
        ...record.metadata,
        patient_info: {
          id: patient.id,
          name: patient.data.name,
          nhs_number: patient.data.nhsNumber,
          dob: patient.data.birthDate
        },
        last_synced: new Date().toISOString()
      };

      const config = this.protocolTables[record.type as keyof typeof this.protocolTables];
      if (config) {
        await supabase
          .from(config.table)
          .update({ metadata: updatedMetadata })
          .eq('id', record.id);
      }
    }

    console.log(`Propagated patient data to ${relatedRecords.length} related records`);
  }

  async getRelatedRecords(patientId: string): Promise<any[]> {
    const { data: edges } = await supabase
      .from('fhir_graph_edges')
      .select('*')
      .eq('source_id', patientId);

    if (!edges || edges.length === 0) return [];

    const records: any[] = [];

    for (const edge of edges) {
      const config = this.protocolTables[edge.target_type as keyof typeof this.protocolTables];
      if (config) {
        const { data } = await supabase
          .from(config.table)
          .select('*')
          .eq('id', edge.target_id)
          .maybeSingle();

        if (data) {
          records.push({ ...data, type: edge.target_type });
        }
      }
    }

    return records;
  }

  async buildCompleteGraph(): Promise<{ nodes: FHIRGraphNode[]; edges: FHIRGraphEdge[] }> {
    const nodes: FHIRGraphNode[] = [];
    const edgesMap = new Map<string, FHIRGraphEdge>();

    for (const [type, config] of Object.entries(this.protocolTables)) {
      const { data: records } = await supabase
        .from(config.table)
        .select('*');

      if (records) {
        records.forEach(record => {
          nodes.push({
            id: record.id,
            type,
            level: config.level,
            data: record.data,
            metadata: record.metadata
          });
        });
      }
    }

    const { data: edges } = await supabase
      .from('fhir_graph_edges')
      .select('*');

    if (edges) {
      edges.forEach(edge => {
        const key = `${edge.source_id}-${edge.target_id}`;
        edgesMap.set(key, edge);
      });
    }

    return {
      nodes,
      edges: Array.from(edgesMap.values())
    };
  }

  async createBidirectionalEdges(sourceType: string, sourceId: string, targetType: string, targetId: string, relationshipType: string): Promise<void> {
    const edges: FHIRGraphEdge[] = [
      {
        source_type: sourceType,
        source_id: sourceId,
        target_type: targetType,
        target_id: targetId,
        relationship_type: relationshipType,
        metadata: { created_at: new Date().toISOString() }
      },
      {
        source_type: targetType,
        source_id: targetId,
        target_type: sourceType,
        target_id: sourceId,
        relationship_type: this.getReverseRelationship(relationshipType),
        metadata: { created_at: new Date().toISOString() }
      }
    ];

    await supabase.from('fhir_graph_edges').insert(edges);
  }

  private getReverseRelationship(relationship: string): string {
    const reverseMap: Record<string, string> = {
      'has_record': 'belongs_to_patient',
      'treated_by': 'treats',
      'diagnosed_during': 'diagnosed',
      'prescribed_at': 'prescription_for',
      'performed_during': 'includes_procedure',
      'recorded_during': 'has_observation',
      'documents': 'documented_by'
    };

    return reverseMap[relationship] || 'related_to';
  }

  async validateGraphIntegrity(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    const { data: edges } = await supabase
      .from('fhir_graph_edges')
      .select('*');

    if (!edges) return { valid: true, issues: [] };

    for (const edge of edges) {
      const sourceConfig = this.protocolTables[edge.source_type as keyof typeof this.protocolTables];
      const targetConfig = this.protocolTables[edge.target_type as keyof typeof this.protocolTables];

      if (!sourceConfig) {
        issues.push(`Invalid source type: ${edge.source_type}`);
        continue;
      }

      if (!targetConfig) {
        issues.push(`Invalid target type: ${edge.target_type}`);
        continue;
      }

      const { data: sourceExists } = await supabase
        .from(sourceConfig.table)
        .select('id')
        .eq('id', edge.source_id)
        .maybeSingle();

      if (!sourceExists) {
        issues.push(`Orphaned edge: source ${edge.source_type}:${edge.source_id} not found`);
      }

      const { data: targetExists } = await supabase
        .from(targetConfig.table)
        .select('id')
        .eq('id', edge.target_id)
        .maybeSingle();

      if (!targetExists) {
        issues.push(`Orphaned edge: target ${edge.target_type}:${edge.target_id} not found`);
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  async cleanOrphanedEdges(): Promise<number> {
    const validation = await this.validateGraphIntegrity();

    if (validation.valid) return 0;

    let deletedCount = 0;

    const { data: edges } = await supabase
      .from('fhir_graph_edges')
      .select('*');

    if (!edges) return 0;

    for (const edge of edges) {
      const sourceConfig = this.protocolTables[edge.source_type as keyof typeof this.protocolTables];
      const targetConfig = this.protocolTables[edge.target_type as keyof typeof this.protocolTables];

      if (!sourceConfig || !targetConfig) {
        await supabase.from('fhir_graph_edges').delete().eq('id', edge.id);
        deletedCount++;
        continue;
      }

      const { data: sourceExists } = await supabase
        .from(sourceConfig.table)
        .select('id')
        .eq('id', edge.source_id)
        .maybeSingle();

      const { data: targetExists } = await supabase
        .from(targetConfig.table)
        .select('id')
        .eq('id', edge.target_id)
        .maybeSingle();

      if (!sourceExists || !targetExists) {
        await supabase.from('fhir_graph_edges').delete().eq('id', edge.id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  async getPatientTimeline(patientId: string): Promise<any[]> {
    const relatedRecords = await this.getRelatedRecords(patientId);

    const timeline = relatedRecords
      .filter(record => record.data.date || record.created_at)
      .map(record => ({
        id: record.id,
        type: record.type,
        title: record.title,
        date: record.data.date || record.created_at,
        data: record.data
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return timeline;
  }

  async exportFHIRBundle(patientId: string): Promise<any> {
    const { data: patient } = await supabase
      .from('fhir_patient_protocols')
      .select('*')
      .eq('id', patientId)
      .maybeSingle();

    if (!patient) throw new Error('Patient not found');

    const relatedRecords = await this.getRelatedRecords(patientId);

    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: patient.id,
            ...patient.data
          }
        },
        ...relatedRecords.map(record => ({
          resource: {
            resourceType: this.getFHIRResourceType(record.type),
            id: record.id,
            ...record.data,
            subject: {
              reference: `Patient/${patientId}`
            }
          }
        }))
      ]
    };

    return bundle;
  }

  private getFHIRResourceType(type: string): string {
    const typeMap: Record<string, string> = {
      patient: 'Patient',
      practitioner: 'Practitioner',
      encounter: 'Encounter',
      condition: 'Condition',
      medication: 'MedicationStatement',
      procedure: 'Procedure',
      observation: 'Observation',
      document: 'DocumentReference'
    };

    return typeMap[type] || 'Resource';
  }

  async syncAllFHIRData(): Promise<void> {
    console.log('Starting complete FHIR data sync to graph...');

    try {
      await supabase.from('fhir_graph_nodes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('fhir_graph_edges').delete().neq('source_id', '00000000-0000-0000-0000-000000000000');

      const nodes: FHIRGraphNode[] = [];
      const edges: FHIRGraphEdge[] = [];
      let patientId: string | null = null;

      for (const [type, config] of Object.entries(this.protocolTables)) {
        const { data: records } = await supabase
          .from(config.table)
          .select('*');

        if (records && records.length > 0) {
          console.log(`Found ${records.length} ${type} records`);

          records.forEach(record => {
            nodes.push({
              id: record.id,
              type,
              level: config.level,
              data: record.data || record,
              metadata: record.metadata || {}
            });

            if (type === 'patient') {
              patientId = record.id;
            } else if (patientId) {
              edges.push({
                source_type: 'patient',
                source_id: patientId,
                target_type: type,
                target_id: record.id,
                relationship_type: 'has',
                metadata: { synced: new Date().toISOString() }
              });
            }
          });
        }
      }

      if (nodes.length > 0) {
        console.log(`Inserting ${nodes.length} nodes into graph...`);
        const { error: nodesError } = await supabase
          .from('fhir_graph_nodes')
          .insert(nodes);

        if (nodesError) {
          console.error('Error inserting nodes:', nodesError);
        }
      }

      if (edges.length > 0) {
        console.log(`Inserting ${edges.length} edges into graph...`);
        const { error: edgesError } = await supabase
          .from('fhir_graph_edges')
          .insert(edges);

        if (edgesError) {
          console.error('Error inserting edges:', edgesError);
        }
      }

      console.log(`✅ Graph sync complete! ${nodes.length} nodes, ${edges.length} edges`);
    } catch (error) {
      console.error('Error syncing FHIR data to graph:', error);
      throw error;
    }
  }
}

export const fhirGraphSync = new FHIRGraphSyncService();
