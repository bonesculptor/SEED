import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      human_contexts: HumanContext;
      business_contexts: BusinessContext;
      machine_contexts: MachineContext;
      data_contexts: DataContext;
      test_contexts: TestContext;
      protocol_validations: ProtocolValidation;
      drift_reports: DriftReport;
      protocol_links: ProtocolLink;
      api_settings: ApiSettings;
    };
  };
}

export interface HumanContext {
  id: string;
  hcp_id: string;
  title: string;
  version: string;
  owner_name: string;
  owner_uri?: string;
  steward_name?: string;
  steward_uri?: string;
  validity_from: string;
  validity_to?: string;
  timezone?: string;
  identity: Record<string, any>;
  context: Record<string, any>;
  resources: Record<string, any>;
  rules: Record<string, any>;
  preferences: Record<string, any>;
  delegation: Record<string, any>;
  audit: Record<string, any>;
  mesh: Record<string, any>;
  obc_map: Record<string, any>;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface BusinessContext {
  id: string;
  bcp_id: string;
  title: string;
  version: string;
  owner_name: string;
  owner_uri?: string;
  validity_from: string;
  validity_to?: string;
  customer_segments: any[];
  value_propositions: any[];
  channels: any[];
  customer_relationships: any[];
  revenue_streams: any[];
  key_resources: any[];
  key_activities: any[];
  key_partners: any[];
  cost_structure: any[];
  metrics: Record<string, any>;
  linked_hcp_id?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface MachineContext {
  id: string;
  mcp_id: string;
  title: string;
  version: string;
  owner_name: string;
  owner_uri?: string;
  pipeline: Record<string, any>;
  tasks: any[];
  models: any[];
  deployment: Record<string, any>;
  monitoring: Record<string, any>;
  linked_hcp_id?: string;
  linked_bcp_id?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface DataContext {
  id: string;
  dcp_id: string;
  title: string;
  version: string;
  owner_name: string;
  owner_uri?: string;
  domain: string;
  data_products: any[];
  contracts: Record<string, any>;
  ports: any[];
  storage: Record<string, any>;
  slas: Record<string, any>;
  policies: any[];
  linked_hcp_id?: string;
  linked_bcp_id?: string;
  linked_mcp_id?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface TestContext {
  id: string;
  tcp_id: string;
  title: string;
  version: string;
  owner_name: string;
  owner_uri?: string;
  baseline: Record<string, any>;
  monitoring: Record<string, any>;
  drift_config: Record<string, any>;
  alerting: Record<string, any>;
  linked_dcp_id?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface ProtocolValidation {
  id: string;
  protocol_type: string;
  protocol_id: string;
  validation_timestamp: string;
  conforms: boolean;
  results: Record<string, any>;
  validator_version?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface DriftReport {
  id: string;
  tcp_id: string;
  report_timestamp: string;
  drift_metrics: Record<string, any>;
  velocity_score?: number;
  alerts: any[];
  baseline_snapshot?: Record<string, any>;
  current_snapshot?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface ProtocolLink {
  id: string;
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  relationship_type: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface ApiSettings {
  id: string;
  api_name: string;
  api_key: string;
  base_url?: string;
  enabled: boolean;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}
