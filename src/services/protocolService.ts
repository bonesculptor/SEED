import { supabase, HumanContext, BusinessContext, MachineContext, DataContext, TestContext, ProtocolValidation, DriftReport } from '../lib/supabase';

export class ProtocolService {
  async createHumanContext(data: Omit<HumanContext, 'id' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('human_contexts')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getHumanContexts() {
    const { data, error } = await supabase
      .from('human_contexts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getHumanContext(id: string) {
    const { data, error } = await supabase
      .from('human_contexts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createBusinessContext(data: Omit<BusinessContext, 'id' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('business_contexts')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getBusinessContexts() {
    const { data, error } = await supabase
      .from('business_contexts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createMachineContext(data: Omit<MachineContext, 'id' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('machine_contexts')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getMachineContexts() {
    const { data, error } = await supabase
      .from('machine_contexts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createDataContext(data: Omit<DataContext, 'id' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('data_contexts')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getDataContexts() {
    const { data, error } = await supabase
      .from('data_contexts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createTestContext(data: Omit<TestContext, 'id' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('test_contexts')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getTestContexts() {
    const { data, error } = await supabase
      .from('test_contexts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async validateProtocol(protocolType: string, protocolId: string, validationResults: any) {
    const { data, error } = await supabase
      .from('protocol_validations')
      .insert({
        protocol_type: protocolType,
        protocol_id: protocolId,
        conforms: validationResults.conforms,
        results: validationResults,
        validator_version: '1.0.0',
        metadata: {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getValidations(protocolType?: string, protocolId?: string) {
    let query = supabase
      .from('protocol_validations')
      .select('*')
      .order('validation_timestamp', { ascending: false });

    if (protocolType) {
      query = query.eq('protocol_type', protocolType);
    }
    if (protocolId) {
      query = query.eq('protocol_id', protocolId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createDriftReport(tcpId: string, metrics: any, velocityScore?: number, alerts: any[] = []) {
    const { data, error } = await supabase
      .from('drift_reports')
      .insert({
        tcp_id: tcpId,
        drift_metrics: metrics,
        velocity_score: velocityScore,
        alerts: alerts,
        metadata: {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDriftReports(tcpId: string) {
    const { data, error } = await supabase
      .from('drift_reports')
      .select('*')
      .eq('tcp_id', tcpId)
      .order('report_timestamp', { ascending: false });

    if (error) throw error;
    return data;
  }

  async linkProtocols(sourceType: string, sourceId: string, targetType: string, targetId: string, relationshipType: string) {
    const { data, error } = await supabase
      .from('protocol_links')
      .insert({
        source_type: sourceType,
        source_id: sourceId,
        target_type: targetType,
        target_id: targetId,
        relationship_type: relationshipType,
        metadata: {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProtocolLinks(sourceType?: string, sourceId?: string) {
    let query = supabase
      .from('protocol_links')
      .select('*')
      .order('created_at', { ascending: false });

    if (sourceType) {
      query = query.eq('source_type', sourceType);
    }
    if (sourceId) {
      query = query.eq('source_id', sourceId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}

export const protocolService = new ProtocolService();
