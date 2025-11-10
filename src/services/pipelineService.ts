import { supabase } from '../lib/supabase';

export interface PipelineNode {
  id: string;
  type: 'hcp' | 'bcp' | 'mcp' | 'dcp' | 'tcp' | 'acp' | 'gcp' | 'geocp' | 'ecp';
  position: { x: number; y: number };
  data: {
    label: string;
    protocol_id?: string;
    config?: Record<string, any>;
  };
}

export interface PipelineEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  type?: string;
}

export interface Pipeline {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  version: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  layout: Record<string, any>;
  settings: Record<string, any>;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineExecution {
  id: string;
  pipeline_id: string;
  workspace_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  execution_log: Array<{
    timestamp: string;
    node_id: string;
    message: string;
    level: 'info' | 'warn' | 'error';
  }>;
  error_details?: Record<string, any>;
  executed_by?: string;
  created_at: string;
}

class PipelineService {
  async getPipelines(workspaceId: string): Promise<Pipeline[]> {
    const { data, error } = await supabase
      .from('pipelines')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching pipelines:', error);
      return [];
    }

    return data || [];
  }

  async getPipeline(id: string): Promise<Pipeline | null> {
    const { data, error } = await supabase
      .from('pipelines')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching pipeline:', error);
      return null;
    }

    return data;
  }

  async createPipeline(pipeline: Partial<Pipeline>): Promise<Pipeline | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('pipelines')
      .insert({
        ...pipeline,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating pipeline:', error);
      return null;
    }

    return data;
  }

  async updatePipeline(id: string, updates: Partial<Pipeline>): Promise<Pipeline | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('pipelines')
      .update({
        ...updates,
        updated_by: user.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating pipeline:', error);
      return null;
    }

    return data;
  }

  async deletePipeline(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('pipelines')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting pipeline:', error);
      return false;
    }

    return true;
  }

  async executePipeline(pipelineId: string, inputData: Record<string, any> = {}): Promise<PipelineExecution | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const pipeline = await this.getPipeline(pipelineId);
    if (!pipeline) return null;

    const { data, error} = await supabase
      .from('pipeline_executions')
      .insert({
        pipeline_id: pipelineId,
        workspace_id: pipeline.workspace_id,
        status: 'running',
        input_data: inputData,
        output_data: {},
        execution_log: [],
        executed_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating pipeline execution:', error);
      return null;
    }

    setTimeout(() => this.processPipelineExecution(data.id, pipeline), 100);

    return data;
  }

  private async processPipelineExecution(executionId: string, pipeline: Pipeline) {
    const startTime = Date.now();
    const executionLog: any[] = [];

    try {
      executionLog.push({
        timestamp: new Date().toISOString(),
        node_id: 'system',
        message: 'Pipeline execution started',
        level: 'info',
      });

      for (const node of pipeline.nodes) {
        executionLog.push({
          timestamp: new Date().toISOString(),
          node_id: node.id,
          message: `Processing ${node.type} node: ${node.data.label}`,
          level: 'info',
        });

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const duration = Date.now() - startTime;

      await supabase
        .from('pipeline_executions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          duration_ms: duration,
          execution_log: executionLog,
          output_data: { success: true, nodes_processed: pipeline.nodes.length },
        })
        .eq('id', executionId);

    } catch (error: any) {
      await supabase
        .from('pipeline_executions')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          execution_log: executionLog,
          error_details: { message: error.message },
        })
        .eq('id', executionId);
    }
  }

  async getExecutions(pipelineId: string): Promise<PipelineExecution[]> {
    const { data, error } = await supabase
      .from('pipeline_executions')
      .select('*')
      .eq('pipeline_id', pipelineId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching executions:', error);
      return [];
    }

    return data || [];
  }

  validatePipeline(pipeline: Pipeline): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (pipeline.nodes.length === 0) {
      errors.push('Pipeline must have at least one node');
    }

    const nodeIds = new Set(pipeline.nodes.map(n => n.id));
    for (const edge of pipeline.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge references non-existent source node: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge references non-existent target node: ${edge.target}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const pipelineService = new PipelineService();
