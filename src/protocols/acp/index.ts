/**
 * Agent Context Protocol (ACP)
 *
 * Defines agent identity, capabilities, and lifecycle management.
 * Enables agent registration, discovery, and inter-agent communication.
 */

export interface AgentIdentity {
  agent_id: string;
  name: string;
  type: string;
  version: string;
  description?: string;
}

export interface AgentCapability {
  capability_id: string;
  name: string;
  type: 'input' | 'output' | 'processing' | 'storage';
  description: string;
  parameters?: Record<string, any>;
}

export interface CommunicationProtocol {
  protocol_name: string;
  version: string;
  endpoints: string[];
  supported_formats: string[];
}

export interface DiscoveryMetadata {
  tags: string[];
  categories: string[];
  search_keywords: string[];
  visibility: 'public' | 'private' | 'workspace';
}

export interface AgentContext {
  id: string;
  acp_id: string;
  title: string;
  version: string;
  owner_name: string;
  owner_uri?: string;
  agent_type: string;
  agent_identity: AgentIdentity;
  capabilities: AgentCapability[];
  communication_protocols: CommunicationProtocol[];
  lifecycle_state: 'registered' | 'active' | 'idle' | 'retired';
  discovery_metadata: DiscoveryMetadata;
  linked_hcp_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const ACP_SCHEMA = {
  type: 'object',
  required: ['acp_id', 'title', 'owner_name', 'agent_type', 'agent_identity'],
  properties: {
    acp_id: { type: 'string' },
    title: { type: 'string' },
    version: { type: 'string' },
    owner_name: { type: 'string' },
    owner_uri: { type: 'string' },
    agent_type: { type: 'string' },
    agent_identity: {
      type: 'object',
      required: ['agent_id', 'name', 'type', 'version'],
      properties: {
        agent_id: { type: 'string' },
        name: { type: 'string' },
        type: { type: 'string' },
        version: { type: 'string' },
        description: { type: 'string' }
      }
    }
  }
};
