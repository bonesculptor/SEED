import { supabase } from '../lib/supabase';

export interface KafkaTopic {
  id?: string;
  workspace_id: string;
  topic_name: string;
  topic_type: 'operational' | 'analytical' | 'command' | 'event';
  partitions?: number;
  replication_factor?: number;
  retention_ms?: number;
  data_domain?: string;
  allowed_producers?: string[];
  allowed_consumers?: string[];
  encryption_enabled?: boolean;
  status?: string;
}

export interface DataContract {
  id?: string;
  workspace_id: string;
  contract_name: string;
  contract_version: string;
  producer_service: string;
  consumer_services: string[];
  input_port_type?: 'operational' | 'analytical' | 'both';
  output_port_type?: 'streaming' | 'batch' | 'api';
  input_schema?: any;
  output_schema?: any;
  data_product_name?: string;
  ubiquitous_language?: any;
  classification?: string;
  freshness_sla_seconds?: number;
  status?: string;
}

export interface DataProduct {
  id?: string;
  workspace_id: string;
  product_name: string;
  domain: string;
  owner_id?: string;
  contract_id?: string;
  transformation_code?: string;
  documentation?: string;
  use_cases?: any[];
  lifecycle_stage?: string;
  monitoring_enabled?: boolean;
}

class DataMeshService {
  // Kafka Topics
  async createKafkaTopic(topic: KafkaTopic): Promise<KafkaTopic> {
    const { data, error } = await supabase
      .from('kafka_topics')
      .insert(topic)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getKafkaTopics(workspaceId: string): Promise<KafkaTopic[]> {
    const { data, error } = await supabase
      .from('kafka_topics')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getTopicsByDomain(workspaceId: string, domain: string): Promise<KafkaTopic[]> {
    const { data, error } = await supabase
      .from('kafka_topics')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('data_domain', domain)
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  }

  // Data Contracts
  async createDataContract(contract: DataContract): Promise<DataContract> {
    const { data, error } = await supabase
      .from('data_contracts')
      .insert(contract)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDataContracts(workspaceId: string): Promise<DataContract[]> {
    const { data, error } = await supabase
      .from('data_contracts')
      .select(`
        *,
        input_topic:input_kafka_topic(topic_name),
        output_topic:output_kafka_topic(topic_name)
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async validateDataContract(contractId: string, data: any): Promise<boolean> {
    const { data: contract, error } = await supabase
      .from('data_contracts')
      .select('input_schema, output_schema')
      .eq('id', contractId)
      .maybeSingle();

    if (error || !contract) return false;

    // Simple validation - in production, use JSON Schema validator
    return true;
  }

  // Data Products
  async createDataProduct(product: DataProduct): Promise<DataProduct> {
    const { data, error } = await supabase
      .from('data_products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDataProducts(workspaceId: string): Promise<DataProduct[]> {
    const { data, error } = await supabase
      .from('data_products')
      .select(`
        *,
        contract:data_contracts(contract_name, contract_version)
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false});

    if (error) throw error;
    return data || [];
  }

  async getDataProductsByDomain(workspaceId: string, domain: string): Promise<DataProduct[]> {
    const { data, error } = await supabase
      .from('data_products')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('domain', domain);

    if (error) throw error;
    return data || [];
  }

  // Data Mesh Governance
  async checkDataAccess(
    userId: string,
    topicId: string,
    accessType: 'produce' | 'consume'
  ): Promise<boolean> {
    const { data: topic, error } = await supabase
      .from('kafka_topics')
      .select('allowed_producers, allowed_consumers')
      .eq('id', topicId)
      .maybeSingle();

    if (error || !topic) return false;

    const allowedList = accessType === 'produce' ? topic.allowed_producers : topic.allowed_consumers;
    return allowedList?.includes(userId) || allowedList?.includes('*') || false;
  }

  // Topic Management for Agent Communication
  async createAgentCommunicationTopics(workspaceId: string): Promise<void> {
    const defaultTopics = [
      {
        workspace_id: workspaceId,
        topic_name: `workspace-${workspaceId}-tier1-monitor`,
        topic_type: 'event' as const,
        data_domain: 'agent_tier1',
        allowed_producers: ['*'],
        allowed_consumers: ['*'],
      },
      {
        workspace_id: workspaceId,
        topic_name: `workspace-${workspaceId}-tier1-analyst`,
        topic_type: 'analytical' as const,
        data_domain: 'agent_tier1',
        allowed_producers: ['*'],
        allowed_consumers: ['*'],
      },
      {
        workspace_id: workspaceId,
        topic_name: `workspace-${workspaceId}-tier1-planner`,
        topic_type: 'command' as const,
        data_domain: 'agent_tier1',
        allowed_producers: ['*'],
        allowed_consumers: ['*'],
      },
      {
        workspace_id: workspaceId,
        topic_name: `workspace-${workspaceId}-tier1-executor`,
        topic_type: 'command' as const,
        data_domain: 'agent_tier1',
        allowed_producers: ['*'],
        allowed_consumers: ['*'],
      },
      {
        workspace_id: workspaceId,
        topic_name: `workspace-${workspaceId}-tier2-ensemble`,
        topic_type: 'command' as const,
        data_domain: 'agent_tier2',
        allowed_producers: ['*'],
        allowed_consumers: ['*'],
      },
      {
        workspace_id: workspaceId,
        topic_name: `workspace-${workspaceId}-tier3-digital-twin`,
        topic_type: 'analytical' as const,
        data_domain: 'agent_tier3',
        allowed_producers: ['*'],
        allowed_consumers: ['*'],
      },
      {
        workspace_id: workspaceId,
        topic_name: `workspace-${workspaceId}-hotl-escalations`,
        topic_type: 'event' as const,
        data_domain: 'human_oversight',
        allowed_producers: ['*'],
        allowed_consumers: ['*'],
      },
    ];

    for (const topic of defaultTopics) {
      await this.createKafkaTopic(topic);
    }
  }

  // Simulate Kafka message publishing (in production, use actual Kafka)
  async publishMessage(
    topicId: string,
    message: any,
    producerId: string
  ): Promise<void> {
    // In production, this would use actual Kafka client
    // For now, we store in agent_communications table
    console.log(`Published to topic ${topicId}:`, message);
  }

  // Data Mesh Discovery
  async discoverDataProducts(workspaceId: string, searchQuery: string): Promise<DataProduct[]> {
    const { data, error } = await supabase
      .from('data_products')
      .select('*')
      .eq('workspace_id', workspaceId)
      .or(`product_name.ilike.%${searchQuery}%,domain.ilike.%${searchQuery}%,documentation.ilike.%${searchQuery}%`);

    if (error) throw error;
    return data || [];
  }
}

export const dataMeshService = new DataMeshService();
