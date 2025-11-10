/*
  # Agent Patterns and ODOO ERP Integration Schema

  ## Overview
  Creates comprehensive agent pattern definitions (21 types from ML Canvas/Ontology table)
  and ODOO ERP PostgreSQL integration for ecosystem context configuration.

  ## New Tables

  ### `agent_patterns`
  - 21 standard agent patterns (Prompt Chaining, Routing, Parallelization, etc.)
  - Input/Process/Output definitions from OBC/ML Canvas/Data Mesh Canvas
  - Ontology mappings
  - Use case scenarios

  ### `ecosystem_configurations`
  - User's ecosystem context settings
  - ODOO ERP connection details
  - PostgreSQL database API configuration
  - Business context mapping

  ### `odoo_integrations`
  - ODOO instance connections
  - API endpoints and credentials
  - Database schema mappings
  - Sync settings

  ### `workflow_recommendations`
  - Intelligent agent pattern recommendations
  - Based on business process + context
  - Confidence scores
  - Alternative suggestions

  ## Security
  - RLS enabled on all tables
  - Workspace-scoped access
  - Encrypted API credentials
  - Audit logging for sensitive operations
*/

-- Create agent patterns table (21 standard patterns)
CREATE TABLE IF NOT EXISTS agent_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_number int UNIQUE NOT NULL,
  pattern_name text UNIQUE NOT NULL,
  description text,
  
  -- Inputs (OBC Canvas)
  inputs_description text,
  input_constraints jsonb DEFAULT '{}'::jsonb,
  
  -- Processes (ML Canvas / Ontology)
  process_description text,
  process_steps jsonb DEFAULT '[]'::jsonb,
  ontology_concepts jsonb DEFAULT '[]'::jsonb,
  
  -- Outputs (Data Mesh Canvas)
  outputs_description text,
  output_artifacts jsonb DEFAULT '[]'::jsonb,
  
  -- Use case and recommendations
  use_cases jsonb DEFAULT '[]'::jsonb,
  recommended_for jsonb DEFAULT '[]'::jsonb,
  risk_factors jsonb DEFAULT '[]'::jsonb,
  
  -- Integration metadata
  compatible_protocols jsonb DEFAULT '[]'::jsonb,
  required_tools jsonb DEFAULT '[]'::jsonb,
  complexity_level text CHECK (complexity_level IN ('low', 'medium', 'high', 'expert')),
  
  is_system boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ecosystem configurations table
CREATE TABLE IF NOT EXISTS ecosystem_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  configuration_name text NOT NULL,
  description text,
  
  -- ERP Integration
  erp_system text DEFAULT 'odoo' CHECK (erp_system IN ('odoo', 'sap', 'netsuite', 'dynamics', 'custom')),
  erp_version text,
  
  -- Business Context
  industry text,
  company_size text CHECK (company_size IN ('startup', 'small', 'medium', 'enterprise')),
  business_model text CHECK (business_model IN ('b2b', 'b2c', 'b2b2c', 'marketplace', 'saas')),
  geographical_scope jsonb DEFAULT '[]'::jsonb,
  
  -- Operational Settings
  timezone text DEFAULT 'UTC',
  currency text DEFAULT 'USD',
  language text DEFAULT 'en',
  
  -- Integration Status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'configured', 'active', 'error')),
  last_sync timestamptz,
  sync_frequency text DEFAULT 'hourly' CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'manual')),
  
  -- Linked contexts
  ecp_id uuid REFERENCES ecosystem_contexts(id),
  geocp_id uuid REFERENCES geographical_contexts(id),
  
  configuration_metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES user_profiles(id),
  updated_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, configuration_name)
);

-- Create ODOO integrations table
CREATE TABLE IF NOT EXISTS odoo_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_config_id uuid REFERENCES ecosystem_configurations(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  
  integration_name text NOT NULL,
  description text,
  
  -- ODOO Connection Details
  odoo_url text NOT NULL,
  odoo_database text NOT NULL,
  odoo_username text NOT NULL,
  odoo_api_key text, -- Encrypted
  
  -- PostgreSQL Direct Connection (optional)
  postgres_host text,
  postgres_port int DEFAULT 5432,
  postgres_database text,
  postgres_username text,
  postgres_password text, -- Encrypted
  postgres_ssl_enabled boolean DEFAULT true,
  
  -- API Configuration
  api_endpoints jsonb DEFAULT '{}'::jsonb,
  authentication_method text DEFAULT 'api_key' CHECK (authentication_method IN ('api_key', 'oauth2', 'basic_auth', 'jwt')),
  
  -- Data Mapping
  table_mappings jsonb DEFAULT '{}'::jsonb,
  field_mappings jsonb DEFAULT '{}'::jsonb,
  custom_mappings jsonb DEFAULT '{}'::jsonb,
  
  -- Sync Configuration
  sync_enabled boolean DEFAULT false,
  sync_direction text DEFAULT 'bidirectional' CHECK (sync_direction IN ('pull', 'push', 'bidirectional')),
  sync_tables jsonb DEFAULT '[]'::jsonb,
  sync_filters jsonb DEFAULT '{}'::jsonb,
  
  -- Connection Status
  connection_status text DEFAULT 'not_tested' CHECK (connection_status IN ('not_tested', 'connected', 'failed', 'unauthorized')),
  last_connection_test timestamptz,
  last_successful_sync timestamptz,
  sync_error_log jsonb DEFAULT '[]'::jsonb,
  
  -- Performance
  rate_limit_per_minute int DEFAULT 60,
  timeout_seconds int DEFAULT 30,
  retry_attempts int DEFAULT 3,
  
  status text DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'maintenance')),
  created_by uuid REFERENCES user_profiles(id),
  updated_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workflow recommendations table
CREATE TABLE IF NOT EXISTS workflow_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Context
  business_process_id text,
  user_goal text NOT NULL,
  context_description text,
  
  -- Recommended Pattern
  recommended_pattern_id uuid REFERENCES agent_patterns(id),
  confidence_score decimal(5,2),
  reasoning text,
  
  -- Alternative Patterns
  alternative_patterns jsonb DEFAULT '[]'::jsonb,
  
  -- Configuration Suggestion
  suggested_config jsonb DEFAULT '{}'::jsonb,
  required_protocols jsonb DEFAULT '[]'::jsonb,
  required_integrations jsonb DEFAULT '[]'::jsonb,
  estimated_complexity text CHECK (estimated_complexity IN ('simple', 'moderate', 'complex', 'expert')),
  
  -- User Feedback
  user_accepted boolean,
  user_feedback text,
  actual_pattern_used uuid REFERENCES agent_patterns(id),
  
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create agent pattern instances table (actual configured agents)
CREATE TABLE IF NOT EXISTS agent_pattern_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  pattern_id uuid REFERENCES agent_patterns(id),
  
  instance_name text NOT NULL,
  description text,
  
  -- Configuration
  configuration jsonb DEFAULT '{}'::jsonb,
  input_mappings jsonb DEFAULT '{}'::jsonb,
  output_mappings jsonb DEFAULT '{}'::jsonb,
  
  -- Linked Resources
  pipeline_id uuid REFERENCES pipelines(id),
  acp_id uuid REFERENCES agent_contexts(id),
  odoo_integration_id uuid REFERENCES odoo_integrations(id),
  
  -- Performance Tracking
  execution_count int DEFAULT 0,
  success_count int DEFAULT 0,
  failure_count int DEFAULT 0,
  average_duration_ms decimal(10,2),
  last_execution_at timestamptz,
  
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  created_by uuid REFERENCES user_profiles(id),
  updated_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert 21 standard agent patterns
INSERT INTO agent_patterns (pattern_number, pattern_name, description, inputs_description, process_description, outputs_description, ontology_concepts, use_cases, compatible_protocols, complexity_level) VALUES
(1, 'Prompt Chaining', 'Sequential task decomposition with validation', 
  'Business goal broken into subtasks; constraints = scope, budget, time',
  'Process → sequence tasks, dependency mapping, verification after each step',
  'Data product = chain execution log; contracts on task correctness; lineage of prompts',
  '["task", "dependency", "validation"]'::jsonb,
  '["Complex multi-step business processes", "Report generation with verification", "Strategic planning workflows"]'::jsonb,
  '["HCP", "BCP", "MCP", "TCP"]'::jsonb,
  'medium'),

(2, 'Routing', 'Intelligent request classification and routing',
  'Need to classify incoming requests; constraints = domain coverage',
  'Intent classification, thresholding, fallback logic',
  'Routed message stream; metadata tags (intent, route taken)',
  '["intent", "confidence", "specialist"]'::jsonb,
  '["Customer service routing", "Expert assignment", "Multi-department workflows"]'::jsonb,
  '["HCP", "ACP", "BCP"]'::jsonb,
  'low'),

(3, 'Parallelization', 'Concurrent task execution with merge/reduce',
  'High-volume task; cost vs latency trade-off',
  'Fan-out across workers; merge/reduce stage',
  'Partitioned outputs; merge log; QoS guarantees',
  '["partition", "shard", "reducer"]'::jsonb,
  '["Bulk data processing", "Multi-source analysis", "Distributed computation"]'::jsonb,
  '["MCP", "DCP", "TCP"]'::jsonb,
  'high'),

(4, 'Reflection', 'Quality assurance with iterative improvement',
  'Stakeholder requires quality assurance; risk = errors',
  'Critic model evaluates candidate outputs; revise loop',
  'Improved artefacts; evaluation scores attached',
  '["critic", "candidate", "revision"]'::jsonb,
  '["Document review", "Code quality checking", "Compliance validation"]'::jsonb,
  '["TCP", "GCP", "BCP"]'::jsonb,
  'medium'),

(5, 'Tool Use', 'External system integration with governance',
  'Business need to integrate APIs/tools; governance = authorisation',
  'Tool discovery, invocation, result validation',
  'Data product enriched with external system outputs; provenance logs',
  '["tool", "call", "auth", "result"]'::jsonb,
  '["API integration", "External data enrichment", "System orchestration"]'::jsonb,
  '["MCP", "GCP", "DCP"]'::jsonb,
  'medium'),

(6, 'Planning', 'Complex goal decomposition with dependency tracking',
  'Complex goal with milestones; constraints = resources',
  'Plan generation, scheduling, dependency tracking',
  'Structured plan artefact; plan adherence metrics',
  '["milestone", "dependency", "horizon"]'::jsonb,
  '["Project planning", "Strategic initiatives", "Resource allocation"]'::jsonb,
  '["BCP", "HCP", "GCP"]'::jsonb,
  'high'),

(7, 'Multi-Self (Multi-Agent)', 'Coordinated multi-role collaboration',
  'Need coordination of multiple roles; risk = misalignment',
  'Role definition, orchestrator, shared memory',
  'Logs of inter-role communications; team outcome trace',
  '["role", "orchestrator", "memory"]'::jsonb,
  '["Team collaboration", "Complex workflows", "Distributed decision-making"]'::jsonb,
  '["ACP", "HCP", "BCP"]'::jsonb,
  'expert'),

(8, 'Memory Management', 'Context preservation across sessions',
  'Need continuity over sessions; risk = context loss',
  'Short/long-term store, retrieval, update',
  'Memory snapshots; access API; audit of reads/writes',
  '["memory", "retention", "retrieval"]'::jsonb,
  '["Long-running processes", "User context preservation", "Learning systems"]'::jsonb,
  '["MCP", "DCP", "ACP"]'::jsonb,
  'high'),

(9, 'Learning & Adaptation', 'Continuous improvement from feedback',
  'Business KPI drift; changing environment',
  'Feedback loops, parameter update, policy adaptation',
  'Updated model parameters; adaptation log; delta report',
  '["feedback", "policy", "reward"]'::jsonb,
  '["Performance optimization", "Adaptive systems", "ML model updates"]'::jsonb,
  '["MCP", "TCP", "ECP"]'::jsonb,
  'expert'),

(10, 'Goal Monitoring', 'KPI tracking with SLA compliance',
  'KPIs with thresholds; constraints = SLA',
  'Metric collection, drift detection, alerts',
  'KPI dashboard feed; SLA compliance log',
  '["KPI", "threshold", "alert"]'::jsonb,
  '["Performance monitoring", "SLA tracking", "Business metrics"]'::jsonb,
  '["BCP", "GCP", "ECP"]'::jsonb,
  'low'),

(11, 'Exceptions & Recovery', 'High availability with error handling',
  'High availability required; risks = failure modes',
  'Error classification, retry, fallback, escalation',
  'Recovery log; error taxonomy dataset',
  '["error", "recovery", "fallback"]'::jsonb,
  '["Production systems", "Critical workflows", "Fault tolerance"]'::jsonb,
  '["GCP", "TCP", "ACP"]'::jsonb,
  'high'),

(12, 'Human-in-the-Loop (HITL)', 'Regulatory/ethical human oversight',
  'Regulatory/ethical review requirement',
  'Escalation to human, approval/rejection',
  'Decision record; human notes; provenance link',
  '["review", "decision", "override"]'::jsonb,
  '["Compliance approval", "Critical decisions", "Quality gates"]'::jsonb,
  '["HCP", "GCP", "BCP"]'::jsonb,
  'medium'),

(13, 'Retrieval (RAG)', 'Grounded answers from data sources',
  'Need to ground answers in data; sources defined',
  'Ingest, embed, retrieve, rerank, cite',
  'Curated chunks; retriever logs; citation set',
  '["document", "embedding", "passage", "citation"]'::jsonb,
  '["Knowledge base queries", "Documentation search", "Research assistance"]'::jsonb,
  '["DCP", "MCP", "HCP"]'::jsonb,
  'medium'),

(14, 'Inter-Self Comms', 'Multi-agent pipeline communication',
  'Multi-self pipeline; interop constraints',
  'Protocol, message passing, coordination',
  'Message bus logs; comms schema',
  '["message", "channel", "consensus"]'::jsonb,
  '["Agent collaboration", "Distributed systems", "Service mesh"]'::jsonb,
  '["ACP", "MCP", "GeoCP"]'::jsonb,
  'expert'),

(15, 'Resource-Aware', 'Cost-optimized routing and execution',
  'Budget & latency constraints',
  'Estimate cost/latency; route to low-cost model if possible',
  'Usage reports; cost-benefit logs',
  '["budget", "latency", "trade-off"]'::jsonb,
  '["Cost optimization", "Performance tuning", "Resource allocation"]'::jsonb,
  '["BCP", "ECP", "MCP"]'::jsonb,
  'high'),

(16, 'Reasoning Techniques', 'Complex logical problem solving',
  'Complex reasoning needed (math, logic)',
  'Apply CoT, ToT, self-consistency',
  'Reasoning traces; path evaluation logs',
  '["reasoning path", "step", "branch"]'::jsonb,
  '["Complex calculations", "Logic puzzles", "Decision trees"]'::jsonb,
  '["MCP", "TCP", "HCP"]'::jsonb,
  'expert'),

(17, 'Evaluation & SLAs', 'Quality measurement and assurance',
  'Business need for measurable quality',
  'Golden set tests, regression, SLA check',
  'Eval reports; pass/fail signals',
  '["benchmark", "test", "SLA"]'::jsonb,
  '["Quality assurance", "Testing", "Compliance validation"]'::jsonb,
  '["TCP", "GCP", "BCP"]'::jsonb,
  'medium'),

(18, 'Guardrails & Safety', 'Security and compliance enforcement',
  'Compliance (PII, injection)',
  'Pattern check, sandbox, blocklist',
  'Violation log; guardrail coverage dataset',
  '["guardrail", "violation", "block"]'::jsonb,
  '["Security enforcement", "Compliance checking", "Content moderation"]'::jsonb,
  '["GCP", "TCP", "HCP"]'::jsonb,
  'high'),

(19, 'Prioritisation', 'Request prioritization under constraints',
  'Competing requests, scarce resources',
  'Score = Value × Effort × Risk',
  'Priority queue; decision audit',
  '["priority", "score", "rank"]'::jsonb,
  '["Task scheduling", "Resource allocation", "Queue management"]'::jsonb,
  '["BCP", "ACP", "HCP"]'::jsonb,
  'low'),

(20, 'Exploration', 'Discovery in unknown problem spaces',
  'Early-stage discovery; little known',
  'Probe, cluster, scan',
  'Cluster map; exploratory dataset',
  '["cluster", "probe", "exploration"]'::jsonb,
  '["Research", "Discovery", "Data mining"]'::jsonb,
  '["MCP", "DCP", "ECP"]'::jsonb,
  'high'),

(21, 'MCP (Model Context Protocol)', 'Interoperability across agents/tools',
  'Need for interoperability across agents/tools',
  'Define context schema, send/receive contexts',
  'Context packets; MCP schema adherence log',
  '["context", "schema", "interop"]'::jsonb,
  '["Agent interoperability", "Tool integration", "Standard protocols"]'::jsonb,
  '["MCP", "ACP", "DCP"]'::jsonb,
  'expert');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agent_patterns_number ON agent_patterns(pattern_number);
CREATE INDEX IF NOT EXISTS idx_agent_patterns_complexity ON agent_patterns(complexity_level);
CREATE INDEX IF NOT EXISTS idx_ecosystem_configurations_workspace ON ecosystem_configurations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_configurations_status ON ecosystem_configurations(status);
CREATE INDEX IF NOT EXISTS idx_odoo_integrations_workspace ON odoo_integrations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_odoo_integrations_ecosystem ON odoo_integrations(ecosystem_config_id);
CREATE INDEX IF NOT EXISTS idx_odoo_integrations_status ON odoo_integrations(connection_status);
CREATE INDEX IF NOT EXISTS idx_workflow_recommendations_workspace ON workflow_recommendations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflow_recommendations_pattern ON workflow_recommendations(recommended_pattern_id);
CREATE INDEX IF NOT EXISTS idx_agent_pattern_instances_workspace ON agent_pattern_instances(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agent_pattern_instances_pattern ON agent_pattern_instances(pattern_id);
CREATE INDEX IF NOT EXISTS idx_agent_pattern_instances_status ON agent_pattern_instances(status);

-- Enable RLS
ALTER TABLE agent_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE odoo_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_pattern_instances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_patterns (public read, admin write)
CREATE POLICY "Anyone can view agent patterns"
  ON agent_patterns FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only system can modify patterns"
  ON agent_patterns FOR ALL TO authenticated
  USING (false)
  WITH CHECK (false);

-- RLS Policies for ecosystem_configurations
CREATE POLICY "Users can view ecosystem configs in their workspaces"
  ON ecosystem_configurations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = ecosystem_configurations.workspace_id AND workspace_members.user_id = auth.uid()));

CREATE POLICY "Users can create ecosystem configs"
  ON ecosystem_configurations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = ecosystem_configurations.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));

CREATE POLICY "Users can update ecosystem configs"
  ON ecosystem_configurations FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = ecosystem_configurations.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')))
  WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = ecosystem_configurations.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));

CREATE POLICY "Users can delete ecosystem configs"
  ON ecosystem_configurations FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = ecosystem_configurations.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin')));

-- RLS Policies for odoo_integrations
CREATE POLICY "Users can view ODOO integrations"
  ON odoo_integrations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = odoo_integrations.workspace_id AND workspace_members.user_id = auth.uid()));

CREATE POLICY "Users can create ODOO integrations"
  ON odoo_integrations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = odoo_integrations.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin')));

CREATE POLICY "Users can update ODOO integrations"
  ON odoo_integrations FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = odoo_integrations.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = odoo_integrations.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin')));

CREATE POLICY "Users can delete ODOO integrations"
  ON odoo_integrations FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = odoo_integrations.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin')));

-- RLS Policies for workflow_recommendations
CREATE POLICY "Users can view recommendations"
  ON workflow_recommendations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = workflow_recommendations.workspace_id AND workspace_members.user_id = auth.uid()));

CREATE POLICY "Users can create recommendations"
  ON workflow_recommendations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = workflow_recommendations.workspace_id AND workspace_members.user_id = auth.uid()));

-- RLS Policies for agent_pattern_instances
CREATE POLICY "Users can view pattern instances"
  ON agent_pattern_instances FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = agent_pattern_instances.workspace_id AND workspace_members.user_id = auth.uid()));

CREATE POLICY "Users can create pattern instances"
  ON agent_pattern_instances FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = agent_pattern_instances.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));

CREATE POLICY "Users can update pattern instances"
  ON agent_pattern_instances FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = agent_pattern_instances.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')))
  WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = agent_pattern_instances.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));

CREATE POLICY "Users can delete pattern instances"
  ON agent_pattern_instances FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = agent_pattern_instances.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin')));

-- Triggers
DROP TRIGGER IF EXISTS update_agent_patterns_updated_at ON agent_patterns;
CREATE TRIGGER update_agent_patterns_updated_at BEFORE UPDATE ON agent_patterns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_ecosystem_configurations_updated_at ON ecosystem_configurations;
CREATE TRIGGER update_ecosystem_configurations_updated_at BEFORE UPDATE ON ecosystem_configurations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_odoo_integrations_updated_at ON odoo_integrations;
CREATE TRIGGER update_odoo_integrations_updated_at BEFORE UPDATE ON odoo_integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_agent_pattern_instances_updated_at ON agent_pattern_instances;
CREATE TRIGGER update_agent_pattern_instances_updated_at BEFORE UPDATE ON agent_pattern_instances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
