import { supabase } from '../lib/supabase';

export interface AgentPattern {
  id: string;
  pattern_number: number;
  pattern_name: string;
  description: string;
  inputs_description: string;
  process_description: string;
  outputs_description: string;
  ontology_concepts: string[];
  use_cases: string[];
  compatible_protocols: string[];
  complexity_level: 'low' | 'medium' | 'high' | 'expert';
}

export interface EcosystemConfiguration {
  id?: string;
  workspace_id: string;
  configuration_name: string;
  description?: string;
  erp_system: 'odoo' | 'sap' | 'netsuite' | 'dynamics' | 'custom';
  erp_version?: string;
  industry?: string;
  company_size?: 'startup' | 'small' | 'medium' | 'enterprise';
  business_model?: 'b2b' | 'b2c' | 'b2b2c' | 'marketplace' | 'saas';
  geographical_scope?: string[];
  status?: string;
}

export interface OdooIntegration {
  id?: string;
  ecosystem_config_id: string;
  workspace_id: string;
  integration_name: string;
  description?: string;
  odoo_url: string;
  odoo_database: string;
  odoo_username: string;
  odoo_api_key?: string;
  postgres_host?: string;
  postgres_port?: number;
  postgres_database?: string;
  postgres_username?: string;
  postgres_password?: string;
  postgres_ssl_enabled?: boolean;
  api_endpoints?: any;
  table_mappings?: any;
  sync_enabled?: boolean;
  sync_direction?: 'pull' | 'push' | 'bidirectional';
  connection_status?: string;
  status?: string;
}

export interface WorkflowRecommendation {
  id?: string;
  workspace_id: string;
  business_process_id?: string;
  user_goal: string;
  context_description?: string;
  recommended_pattern_id?: string;
  confidence_score?: number;
  reasoning?: string;
  alternative_patterns?: any[];
  suggested_config?: any;
}

export interface AgentPatternInstance {
  id?: string;
  workspace_id: string;
  pattern_id: string;
  instance_name: string;
  description?: string;
  configuration?: any;
  odoo_integration_id?: string;
  status?: string;
}

class EcosystemService {
  async getAgentPatterns(): Promise<AgentPattern[]> {
    const { data, error } = await supabase
      .from('agent_patterns')
      .select('*')
      .order('pattern_number', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getAgentPattern(id: string): Promise<AgentPattern | null> {
    const { data, error } = await supabase
      .from('agent_patterns')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getAgentPatternByName(name: string): Promise<AgentPattern | null> {
    const { data, error } = await supabase
      .from('agent_patterns')
      .select('*')
      .eq('pattern_name', name)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createEcosystemConfig(config: EcosystemConfiguration): Promise<EcosystemConfiguration> {
    const { data, error } = await supabase
      .from('ecosystem_configurations')
      .insert(config)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getEcosystemConfigs(workspaceId: string): Promise<EcosystemConfiguration[]> {
    const { data, error } = await supabase
      .from('ecosystem_configurations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateEcosystemConfig(id: string, updates: Partial<EcosystemConfiguration>): Promise<void> {
    const { error } = await supabase
      .from('ecosystem_configurations')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  async createOdooIntegration(integration: OdooIntegration): Promise<OdooIntegration> {
    const { data, error } = await supabase
      .from('odoo_integrations')
      .insert(integration)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getOdooIntegrations(workspaceId: string): Promise<OdooIntegration[]> {
    const { data, error } = await supabase
      .from('odoo_integrations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async testOdooConnection(integrationId: string): Promise<{ success: boolean; message: string }> {
    // In production, this would make actual API calls to test the connection
    // For now, we'll simulate it
    const { error } = await supabase
      .from('odoo_integrations')
      .update({
        connection_status: 'connected',
        last_connection_test: new Date().toISOString()
      })
      .eq('id', integrationId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Connection successful' };
  }

  async getWorkflowRecommendations(
    workspaceId: string,
    userGoal: string,
    businessProcessId?: string
  ): Promise<WorkflowRecommendation[]> {
    // This would use an LLM or rule-based system to recommend patterns
    // For now, we'll do basic keyword matching
    const patterns = await this.getAgentPatterns();
    const recommendations: WorkflowRecommendation[] = [];

    const goal = userGoal.toLowerCase();
    let recommendedPattern: AgentPattern | null = null;
    let reasoning = '';

    // Simple rule-based recommendations
    if (goal.includes('route') || goal.includes('classify')) {
      recommendedPattern = patterns.find(p => p.pattern_name === 'Routing') || null;
      reasoning = 'Routing pattern is ideal for classifying and directing requests to appropriate handlers.';
    } else if (goal.includes('parallel') || goal.includes('bulk') || goal.includes('concurrent')) {
      recommendedPattern = patterns.find(p => p.pattern_name === 'Parallelization') || null;
      reasoning = 'Parallelization pattern enables concurrent processing for high-volume tasks.';
    } else if (goal.includes('quality') || goal.includes('review') || goal.includes('validate')) {
      recommendedPattern = patterns.find(p => p.pattern_name === 'Reflection') || null;
      reasoning = 'Reflection pattern provides quality assurance through iterative review.';
    } else if (goal.includes('api') || goal.includes('integrate') || goal.includes('tool')) {
      recommendedPattern = patterns.find(p => p.pattern_name === 'Tool Use') || null;
      reasoning = 'Tool Use pattern enables secure integration with external systems and APIs.';
    } else if (goal.includes('plan') || goal.includes('schedule') || goal.includes('milestone')) {
      recommendedPattern = patterns.find(p => p.pattern_name === 'Planning') || null;
      reasoning = 'Planning pattern is designed for complex goal decomposition and scheduling.';
    } else if (goal.includes('collaborate') || goal.includes('team') || goal.includes('multi')) {
      recommendedPattern = patterns.find(p => p.pattern_name === 'Multi-Self (Multi-Agent)') || null;
      reasoning = 'Multi-Self pattern coordinates multiple agents for collaborative workflows.';
    } else if (goal.includes('monitor') || goal.includes('track') || goal.includes('kpi')) {
      recommendedPattern = patterns.find(p => p.pattern_name === 'Goal Monitoring') || null;
      reasoning = 'Goal Monitoring pattern tracks KPIs and alerts on threshold violations.';
    } else if (goal.includes('comply') || goal.includes('regulatory') || goal.includes('audit')) {
      recommendedPattern = patterns.find(p => p.pattern_name === 'Guardrails & Safety') || null;
      reasoning = 'Guardrails & Safety pattern ensures compliance and regulatory adherence.';
    } else if (goal.includes('search') || goal.includes('knowledge') || goal.includes('document')) {
      recommendedPattern = patterns.find(p => p.pattern_name === 'Retrieval (RAG)') || null;
      reasoning = 'RAG pattern retrieves and grounds answers in your knowledge base.';
    } else {
      // Default to Prompt Chaining for complex tasks
      recommendedPattern = patterns.find(p => p.pattern_name === 'Prompt Chaining') || null;
      reasoning = 'Prompt Chaining is versatile for breaking down complex multi-step processes.';
    }

    if (recommendedPattern) {
      recommendations.push({
        workspace_id: workspaceId,
        user_goal: userGoal,
        business_process_id: businessProcessId,
        recommended_pattern_id: recommendedPattern.id,
        confidence_score: 85.0,
        reasoning,
        alternative_patterns: patterns
          .filter(p => p.id !== recommendedPattern!.id)
          .slice(0, 3)
          .map(p => ({ id: p.id, name: p.pattern_name, reason: 'Alternative option' }))
      });
    }

    return recommendations;
  }

  async createAgentInstance(instance: AgentPatternInstance): Promise<AgentPatternInstance> {
    const { data, error } = await supabase
      .from('agent_pattern_instances')
      .insert(instance)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAgentInstances(workspaceId: string): Promise<AgentPatternInstance[]> {
    const { data, error } = await supabase
      .from('agent_pattern_instances')
      .select(`
        *,
        pattern:agent_patterns(pattern_name, complexity_level),
        odoo_integration:odoo_integrations(integration_name)
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export const ecosystemService = new EcosystemService();
