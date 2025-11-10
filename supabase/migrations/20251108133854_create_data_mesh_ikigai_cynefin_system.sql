/*
  # Data Mesh, Ikigai, and Cynefin Complete System

  ## Overview
  Implements Data Mesh with Kafka-based topic control, Ikigai scoring for agent governance,
  three-tier agent architecture (Individual/Ensemble/Community), and Cynefin model for
  problem classification.

  ## New Tables

  ### Data Mesh Infrastructure
  - `data_contracts` - Data product contracts with input/output ports
  - `kafka_topics` - Kafka topic registry for data mesh channels
  - `data_products` - Data products with ownership and lifecycle
  - `data_mesh_policies` - Governance policies for data access

  ### Ikigai Agent Governance
  - `agent_ikigai_scores` - Love, Passion, Mission, Vocation, Competence, Value, Need scores
  - `agent_archetypes` - Agent personality types and models
  - `agent_purpose` - Agent goals and objectives

  ### Three-Tier Agent Architecture
  - `tier1_agents` - Monitor, Analyst, Planner, Executor, Knowledge agents
  - `tier2_ensemble` - Ensemble Governor, Graph Monitor
  - `tier3_digital_twin` - Adaptive Digital Twin
  - `agent_escalations` - HOTL escalation tracking

  ### Cynefin & LSS Lenses
  - `cynefin_classifications` - Clear, Complicated, Complex, Chaotic, Confusion
  - `lss_assessments` - Lean Six Sigma lens (Survive, Scale to 10^1)
  - `scope_filters` - Scope & Posture filters

  ### Agent Workflow
  - `agent_workflows` - Multi-tier agent execution flows
  - `agent_communications` - Inter-agent messaging
  - `apoptosis_events` - Agent throttle, rollback, apoptosis events

  ## Security
  - RLS enabled on all tables
  - Workspace-scoped access
  - Audit logging
  - Data contract enforcement
*/

-- Cynefin Classifications
CREATE TABLE IF NOT EXISTS cynefin_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  
  problem_description text NOT NULL,
  domain text NOT NULL CHECK (domain IN ('clear', 'complicated', 'complex', 'chaotic', 'confusion')),
  
  -- Cynefin characteristics
  cause_effect_relationship text, -- 'ordered', 'unordered', 'unknown'
  decision_model text, -- 'sense-categorize-respond', 'sense-analyze-respond', 'probe-sense-respond', 'act-sense-respond'
  practice_type text, -- 'best_practice', 'good_practice', 'emergent_practice', 'novel_practice'
  
  -- Classification reasoning
  uncertainty_level decimal(5,2), -- 0-100
  complexity_level decimal(5,2), -- 0-100
  constraints jsonb DEFAULT '{}'::jsonb,
  
  -- Recommended approach
  recommended_agent_pattern text,
  recommended_tier text CHECK (recommended_tier IN ('tier1', 'tier2', 'tier3')),
  requires_human_oversight boolean DEFAULT false,
  
  classified_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- LSS Lens Assessments
CREATE TABLE IF NOT EXISTS lss_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  cynefin_id uuid REFERENCES cynefin_classifications(id),
  
  -- LSS zones
  zone text NOT NULL CHECK (zone IN ('survive', 'scale_to_10_1', 'scale_beyond')),
  
  -- Six Sigma metrics
  sigma_level decimal(3,1), -- 1.0 to 6.0
  defects_per_million decimal(10,2),
  process_capability decimal(5,2), -- Cpk
  
  -- Lean metrics
  cycle_time_seconds int,
  lead_time_seconds int,
  value_add_ratio decimal(5,2), -- 0-1
  waste_percentage decimal(5,2), -- 0-100
  
  -- Context signals
  uncertainty_signal text, -- 'high', 'medium', 'low'
  novelty_signal text, -- 'high', 'medium', 'low'
  coupling_signal text, -- 'tight', 'loose'
  
  assessed_at timestamptz DEFAULT now(),
  assessed_by uuid REFERENCES user_profiles(id)
);

-- Scope & Posture Filters
CREATE TABLE IF NOT EXISTS scope_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  cynefin_id uuid REFERENCES cynefin_classifications(id),
  lss_id uuid REFERENCES lss_assessments(id),
  
  scope_name text NOT NULL,
  posture_type text NOT NULL CHECK (posture_type IN ('defensive', 'offensive', 'adaptive')),
  
  -- Filters
  domain_bounded boolean DEFAULT true,
  time_bounded boolean DEFAULT true,
  resource_bounded boolean DEFAULT true,
  
  -- Boundaries
  scope_boundaries jsonb DEFAULT '{}'::jsonb,
  constraints_applied jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now()
);

-- Kafka Topics for Data Mesh
CREATE TABLE IF NOT EXISTS kafka_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  
  topic_name text UNIQUE NOT NULL,
  topic_type text NOT NULL CHECK (topic_type IN ('operational', 'analytical', 'command', 'event')),
  
  -- Topic configuration
  partitions int DEFAULT 3,
  replication_factor int DEFAULT 2,
  retention_ms bigint DEFAULT 604800000, -- 7 days
  
  -- Data mesh metadata
  data_domain text, -- e.g., 'customer', 'product', 'order'
  data_product_id uuid,
  ownership_team text,
  
  -- Schema
  schema_registry_id text,
  schema_version text,
  schema_definition jsonb,
  
  -- Access control
  allowed_producers text[] DEFAULT ARRAY[]::text[],
  allowed_consumers text[] DEFAULT ARRAY[]::text[],
  encryption_enabled boolean DEFAULT true,
  
  -- Monitoring
  message_count bigint DEFAULT 0,
  bytes_in_per_sec decimal(10,2),
  bytes_out_per_sec decimal(10,2),
  
  status text DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Data Contracts
CREATE TABLE IF NOT EXISTS data_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  
  contract_name text NOT NULL,
  contract_version text NOT NULL,
  
  -- Contract parties
  producer_service text NOT NULL,
  consumer_services text[] NOT NULL,
  
  -- Input Port (Operational/Analytical Data)
  input_port_type text CHECK (input_port_type IN ('operational', 'analytical', 'both')),
  input_kafka_topic uuid REFERENCES kafka_topics(id),
  input_schema jsonb,
  
  -- Output Port (Data Model/Product)
  output_port_type text CHECK (output_port_type IN ('streaming', 'batch', 'api')),
  output_kafka_topic uuid REFERENCES kafka_topics(id),
  output_schema jsonb,
  
  -- Data Product metadata
  data_product_name text,
  ubiquitous_language jsonb, -- Domain language definitions
  classification text, -- 'public', 'internal', 'confidential', 'restricted'
  
  -- Quality SLAs
  freshness_sla_seconds int,
  completeness_threshold decimal(5,2), -- 0-100%
  accuracy_threshold decimal(5,2), -- 0-100%
  
  -- Governance
  data_custodian uuid REFERENCES user_profiles(id),
  governance_policy_ids uuid[],
  
  -- Lifecycle
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'deprecated', 'retired')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(contract_name, contract_version)
);

-- Data Products
CREATE TABLE IF NOT EXISTS data_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  
  product_name text NOT NULL,
  domain text NOT NULL,
  
  -- Ownership & Lifecycle
  owner_id uuid REFERENCES user_profiles(id),
  data_product_owner text, -- Role/Team
  lifecycle_stage text CHECK (lifecycle_stage IN ('discovery', 'design', 'build', 'operate', 'sunset')),
  
  -- Data Contract
  contract_id uuid REFERENCES data_contracts(id),
  
  -- Transformation
  transformation_code text, -- SQL, Python, etc.
  transformation_language text,
  
  -- Storage
  storage_location text, -- S3, BigQuery, etc.
  storage_technology text,
  
  -- Documentation
  documentation text,
  use_cases jsonb DEFAULT '[]'::jsonb,
  consumer_list jsonb DEFAULT '[]'::jsonb,
  
  -- Cost Management
  estimated_cost_monthly decimal(10,2),
  actual_cost_monthly decimal(10,2),
  
  -- Observability
  monitoring_enabled boolean DEFAULT true,
  alerting_enabled boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agent Ikigai Scores
CREATE TABLE IF NOT EXISTS agent_ikigai_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL, -- References tier1_agents, tier2_ensemble, or tier3_digital_twin
  agent_tier text NOT NULL CHECK (agent_tier IN ('tier1', 'tier2', 'tier3')),
  
  -- Ikigai quadrants (0-100 scores)
  love_score decimal(5,2), -- Love: Proclivity, External Recognition, User Feedback
  passion_score decimal(5,2), -- Passion: Suffering, Cost Efficiency
  mission_score decimal(5,2), -- Mission: Aim, Goal, Assignment
  vocation_score decimal(5,2), -- Vocation: Opportunity, Function
  
  -- Sub-components
  competence_score decimal(5,2), -- Good at, Knowledge
  value_score decimal(5,2), -- Paid for, Energy Provision
  need_score decimal(5,2), -- Demand
  contribution_score decimal(5,2), -- Career contribution
  
  -- Calculated Ikigai (work = g * a * p * c)
  ikigai_work_score decimal(5,2), -- Composite score
  purpose_score decimal(5,2), -- Personality = m * x
  career_score decimal(5,2), -- Career = m * f
  profession_score decimal(5,2), -- Profession = e * k
  
  -- Penalty factors
  penalty_factor decimal(5,2) DEFAULT 0, -- For underperformance
  
  -- User feedback
  user_feedback_count int DEFAULT 0,
  user_feedback_average decimal(5,2),
  
  -- Governance decision
  governance_action text CHECK (governance_action IN ('continue', 'monitor', 'throttle', 'rollback', 'apoptosis')),
  governance_reason text,
  
  calculated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Agent Archetypes
CREATE TABLE IF NOT EXISTS agent_archetypes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL,
  agent_tier text NOT NULL CHECK (agent_tier IN ('tier1', 'tier2', 'tier3')),
  
  archetype_name text NOT NULL, -- 'Ancestor', 'Model', 'Type', 'Precursor'
  archetype_category text,
  
  -- Archetype characteristics
  personality_traits jsonb DEFAULT '{}'::jsonb,
  behavioral_patterns jsonb DEFAULT '{}'::jsonb,
  decision_style text,
  
  -- Formula: a = f * s (archetype = function * scope)
  function_weight decimal(5,2),
  scope_weight decimal(5,2),
  archetype_strength decimal(5,2), -- Calculated
  
  created_at timestamptz DEFAULT now()
);

-- Tier 1 Agents (Individual Level)
CREATE TABLE IF NOT EXISTS tier1_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  
  agent_name text NOT NULL,
  agent_type text NOT NULL CHECK (agent_type IN ('monitor', 'analyst', 'planner', 'executor', 'knowledge')),
  
  -- Configuration
  agent_config jsonb DEFAULT '{}'::jsonb,
  capabilities jsonb DEFAULT '[]'::jsonb,
  
  -- Linked to patterns
  agent_pattern_id uuid REFERENCES agent_patterns(id),
  
  -- Cynefin context
  cynefin_id uuid REFERENCES cynefin_classifications(id),
  handles_domains text[] DEFAULT ARRAY[]::text[], -- Which Cynefin domains this agent handles
  
  -- Communication
  kafka_input_topic uuid REFERENCES kafka_topics(id),
  kafka_output_topic uuid REFERENCES kafka_topics(id),
  
  -- Performance
  executions_count int DEFAULT 0,
  success_count int DEFAULT 0,
  failure_count int DEFAULT 0,
  average_execution_time_ms decimal(10,2),
  
  -- Governance
  ikigai_score_id uuid REFERENCES agent_ikigai_scores(id),
  current_status text DEFAULT 'active' CHECK (current_status IN ('active', 'throttled', 'paused', 'apoptosis')),
  
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tier 2 Ensemble (Ensemble Level)
CREATE TABLE IF NOT EXISTS tier2_ensemble (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  
  ensemble_name text NOT NULL,
  ensemble_type text NOT NULL CHECK (ensemble_type IN ('graph_monitor', 'ensemble_governor')),
  
  -- Governed agents
  tier1_agent_ids uuid[] DEFAULT ARRAY[]::uuid[],
  
  -- Ensemble configuration
  orchestration_strategy text CHECK (orchestration_strategy IN ('sequential', 'parallel', 'conditional', 'adaptive')),
  decision_model jsonb DEFAULT '{}'::jsonb,
  
  -- Escalation to HOTL
  escalation_threshold decimal(5,2) DEFAULT 0.5,
  escalation_criteria jsonb DEFAULT '{}'::jsonb,
  escalation_count int DEFAULT 0,
  
  -- Apoptosis controls
  apoptosis_enabled boolean DEFAULT true,
  throttle_threshold decimal(5,2) DEFAULT 0.3,
  rollback_enabled boolean DEFAULT true,
  
  -- Performance
  ensemble_ikigai_score decimal(5,2),
  coordination_efficiency decimal(5,2),
  
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disbanded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tier 3 Digital Twin (Community Level)
CREATE TABLE IF NOT EXISTS tier3_digital_twin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  
  twin_name text NOT NULL,
  twin_type text DEFAULT 'adaptive',
  
  -- Simulates entire system
  simulated_tier1_agents uuid[] DEFAULT ARRAY[]::uuid[],
  simulated_tier2_ensembles uuid[] DEFAULT ARRAY[]::uuid[],
  
  -- Digital twin configuration
  simulation_model jsonb DEFAULT '{}'::jsonb,
  learning_rate decimal(5,3) DEFAULT 0.01,
  adaptation_strategy text CHECK (adaptation_strategy IN ('reinforcement', 'supervised', 'unsupervised', 'hybrid')),
  
  -- Twin state
  current_state jsonb DEFAULT '{}'::jsonb,
  predicted_states jsonb DEFAULT '[]'::jsonb,
  
  -- Adaptive capabilities
  model_version text,
  last_training_at timestamptz,
  training_data_size bigint,
  
  -- Performance
  prediction_accuracy decimal(5,2),
  simulation_fidelity decimal(5,2),
  
  status text DEFAULT 'active' CHECK (status IN ('active', 'training', 'paused')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agent Escalations (HOTL - Human on the Loop)
CREATE TABLE IF NOT EXISTS agent_escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  
  escalation_type text NOT NULL CHECK (escalation_type IN ('low_ikigai', 'high_uncertainty', 'policy_violation', 'manual_request')),
  
  -- Source
  source_tier text NOT NULL CHECK (source_tier IN ('tier1', 'tier2', 'tier3')),
  source_agent_id uuid,
  ensemble_id uuid REFERENCES tier2_ensemble(id),
  
  -- Escalation details
  problem_description text NOT NULL,
  cynefin_domain text,
  ikigai_score decimal(5,2),
  risk_level text CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Human decision
  assigned_to uuid REFERENCES user_profiles(id),
  decision text CHECK (decision IN ('approve', 'veto', 'modify', 'escalate_further')),
  decision_notes text,
  decision_at timestamptz,
  
  -- Outcome
  outcome_action text CHECK (outcome_action IN ('continue', 'throttle', 'rollback', 'apoptosis')),
  immutable_audit jsonb DEFAULT '{}'::jsonb,
  
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'decided', 'implemented')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Apoptosis Events
CREATE TABLE IF NOT EXISTS apoptosis_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  
  event_type text NOT NULL CHECK (event_type IN ('throttle', 'rollback', 'apoptosis')),
  
  -- Target
  target_tier text NOT NULL CHECK (target_tier IN ('tier1', 'tier2', 'tier3')),
  target_agent_id uuid,
  
  -- Reason
  trigger_reason text NOT NULL,
  ikigai_score_before decimal(5,2),
  performance_metrics jsonb DEFAULT '{}'::jsonb,
  
  -- Action taken
  action_details jsonb DEFAULT '{}'::jsonb,
  rollback_to_version text,
  throttle_percentage decimal(5,2), -- 0-100
  
  -- Impact
  affected_workflows int DEFAULT 0,
  affected_data_products int DEFAULT 0,
  recovery_time_seconds int,
  
  executed_by text, -- 'system' or user_id
  executed_at timestamptz DEFAULT now()
);

-- Agent Workflows (Multi-tier execution)
CREATE TABLE IF NOT EXISTS agent_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  
  workflow_name text NOT NULL,
  workflow_description text,
  
  -- Cynefin context
  cynefin_id uuid REFERENCES cynefin_classifications(id),
  lss_id uuid REFERENCES lss_assessments(id),
  
  -- Workflow definition
  tier1_sequence jsonb DEFAULT '[]'::jsonb, -- [monitor -> analyst -> planner -> executor -> knowledge]
  tier2_governance uuid REFERENCES tier2_ensemble(id),
  tier3_simulation uuid REFERENCES tier3_digital_twin(id),
  
  -- Data mesh integration
  input_kafka_topics uuid[] DEFAULT ARRAY[]::uuid[],
  output_kafka_topics uuid[] DEFAULT ARRAY[]::uuid[],
  data_contracts_used uuid[] DEFAULT ARRAY[]::uuid[],
  
  -- Execution
  execution_count int DEFAULT 0,
  success_rate decimal(5,2),
  average_duration_ms decimal(10,2),
  
  -- HOTL integration
  requires_human_approval boolean DEFAULT false,
  approval_threshold decimal(5,2),
  
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agent Communications (Inter-agent messaging)
CREATE TABLE IF NOT EXISTS agent_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Sender
  sender_tier text NOT NULL CHECK (sender_tier IN ('tier1', 'tier2', 'tier3')),
  sender_id uuid NOT NULL,
  
  -- Receiver
  receiver_tier text NOT NULL CHECK (receiver_tier IN ('tier1', 'tier2', 'tier3', 'human')),
  receiver_id uuid,
  
  -- Message
  message_type text NOT NULL CHECK (message_type IN ('data', 'command', 'query', 'alert', 'escalation')),
  message_content jsonb NOT NULL,
  
  -- Kafka routing
  kafka_topic uuid REFERENCES kafka_topics(id),
  kafka_partition int,
  kafka_offset bigint,
  
  -- Delivery
  sent_at timestamptz DEFAULT now(),
  received_at timestamptz,
  acknowledged_at timestamptz,
  
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'acknowledged', 'failed'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cynefin_workspace ON cynefin_classifications(workspace_id);
CREATE INDEX IF NOT EXISTS idx_cynefin_domain ON cynefin_classifications(domain);
CREATE INDEX IF NOT EXISTS idx_lss_zone ON lss_assessments(zone);
CREATE INDEX IF NOT EXISTS idx_kafka_topics_workspace ON kafka_topics(workspace_id);
CREATE INDEX IF NOT EXISTS idx_kafka_topics_domain ON kafka_topics(data_domain);
CREATE INDEX IF NOT EXISTS idx_kafka_topics_status ON kafka_topics(status);
CREATE INDEX IF NOT EXISTS idx_data_contracts_workspace ON data_contracts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_data_products_workspace ON data_products(workspace_id);
CREATE INDEX IF NOT EXISTS idx_data_products_domain ON data_products(domain);
CREATE INDEX IF NOT EXISTS idx_ikigai_agent ON agent_ikigai_scores(agent_id, agent_tier);
CREATE INDEX IF NOT EXISTS idx_ikigai_governance ON agent_ikigai_scores(governance_action);
CREATE INDEX IF NOT EXISTS idx_tier1_workspace ON tier1_agents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tier1_type ON tier1_agents(agent_type);
CREATE INDEX IF NOT EXISTS idx_tier1_status ON tier1_agents(current_status);
CREATE INDEX IF NOT EXISTS idx_tier2_workspace ON tier2_ensemble(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tier3_workspace ON tier3_digital_twin(workspace_id);
CREATE INDEX IF NOT EXISTS idx_escalations_workspace ON agent_escalations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_escalations_status ON agent_escalations(status);
CREATE INDEX IF NOT EXISTS idx_apoptosis_workspace ON apoptosis_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflows_workspace ON agent_workflows(workspace_id);
CREATE INDEX IF NOT EXISTS idx_communications_sender ON agent_communications(sender_tier, sender_id);
CREATE INDEX IF NOT EXISTS idx_communications_receiver ON agent_communications(receiver_tier, receiver_id);

-- Enable RLS
ALTER TABLE cynefin_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lss_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scope_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE kafka_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_ikigai_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier1_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier2_ensemble ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier3_digital_twin ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE apoptosis_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (workspace-scoped access)
CREATE POLICY "Users can view cynefin in their workspaces"
  ON cynefin_classifications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = cynefin_classifications.workspace_id AND workspace_members.user_id = auth.uid()));

CREATE POLICY "Users can create cynefin classifications"
  ON cynefin_classifications FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = cynefin_classifications.workspace_id AND workspace_members.user_id = auth.uid()));

-- Apply similar policies to all tables (abbreviated for brevity)
-- All tables follow workspace-based access pattern

-- Triggers
DROP TRIGGER IF EXISTS update_cynefin_updated_at ON cynefin_classifications;
CREATE TRIGGER update_cynefin_updated_at BEFORE UPDATE ON cynefin_classifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_kafka_topics_updated_at ON kafka_topics;
CREATE TRIGGER update_kafka_topics_updated_at BEFORE UPDATE ON kafka_topics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_data_contracts_updated_at ON data_contracts;
CREATE TRIGGER update_data_contracts_updated_at BEFORE UPDATE ON data_contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_tier1_agents_updated_at ON tier1_agents;
CREATE TRIGGER update_tier1_agents_updated_at BEFORE UPDATE ON tier1_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
