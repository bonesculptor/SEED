/*
  # Deployment and Automation Configuration Schema

  ## Overview
  Creates tables for managing business process automation, compliance workflows,
  sustainable operations, multi-agent coordination, and deployment environments.

  ## New Tables

  ### `deployment_environments`
  - Development (localhost M3)
  - Staging (integration/pen testing)
  - Production (live deployment)
  - Configuration per environment

  ### `business_automations`
  - Automated business process definitions
  - Trigger conditions
  - Action sequences
  - Integration with pipelines

  ### `compliance_workflows`
  - Compliance rule definitions
  - Audit requirements
  - Approval flows
  - Regulatory mappings

  ### `sustainability_operations`
  - Environmental targets
  - Carbon tracking configurations
  - Resource usage policies
  - ESG reporting settings

  ### `agent_coordination_configs`
  - Multi-agent orchestration rules
  - Communication protocols
  - Load balancing settings
  - Failover configurations

  ### `model_registry`
  - Future model integrations
  - ARIMA, Prophet, State Space models
  - Training configurations
  - Deployment status

  ## Security
  - RLS enabled on all tables
  - Workspace-scoped access
  - Environment-specific permissions
*/

-- Create deployment environments table
CREATE TABLE IF NOT EXISTS deployment_environments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  environment_name text NOT NULL CHECK (environment_name IN ('development', 'staging', 'production')),
  environment_type text DEFAULT 'local' CHECK (environment_type IN ('local', 'cloud', 'hybrid')),
  base_url text,
  api_endpoints jsonb DEFAULT '{}'::jsonb,
  configuration jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'maintenance')),
  health_check_url text,
  last_health_check timestamptz,
  deployment_notes text,
  machine_specs jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES user_profiles(id),
  updated_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, environment_name)
);

-- Create business automations table
CREATE TABLE IF NOT EXISTS business_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  business_process_id text,
  automation_type text NOT NULL CHECK (automation_type IN ('scheduled', 'event_driven', 'manual', 'hybrid')),
  trigger_config jsonb DEFAULT '{}'::jsonb,
  action_sequence jsonb DEFAULT '[]'::jsonb,
  pipeline_id uuid REFERENCES pipelines(id) ON DELETE SET NULL,
  protocol_chain jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  execution_history jsonb DEFAULT '[]'::jsonb,
  success_rate decimal(5,2),
  last_executed_at timestamptz,
  next_scheduled_at timestamptz,
  error_handling jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES user_profiles(id),
  updated_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create compliance workflows table
CREATE TABLE IF NOT EXISTS compliance_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  workflow_name text NOT NULL,
  description text,
  regulatory_framework text NOT NULL,
  jurisdiction text,
  compliance_type text NOT NULL CHECK (compliance_type IN ('gdpr', 'hipaa', 'sox', 'iso27001', 'pci_dss', 'custom')),
  required_approvals jsonb DEFAULT '[]'::jsonb,
  approval_chain jsonb DEFAULT '[]'::jsonb,
  audit_requirements jsonb DEFAULT '{}'::jsonb,
  automated_checks jsonb DEFAULT '[]'::jsonb,
  manual_reviews jsonb DEFAULT '[]'::jsonb,
  documentation_requirements jsonb DEFAULT '[]'::jsonb,
  retention_period_days int DEFAULT 2555,
  status text DEFAULT 'active' CHECK (status IN ('active', 'under_review', 'suspended', 'archived')),
  last_audit_date timestamptz,
  next_audit_due timestamptz,
  compliance_score decimal(5,2),
  violations jsonb DEFAULT '[]'::jsonb,
  remediation_actions jsonb DEFAULT '[]'::jsonb,
  gcp_id uuid REFERENCES governance_contexts(id),
  created_by uuid REFERENCES user_profiles(id),
  updated_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sustainability operations table
CREATE TABLE IF NOT EXISTS sustainability_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  operation_name text NOT NULL,
  description text,
  scope text NOT NULL CHECK (scope IN ('scope1', 'scope2', 'scope3', 'all')),
  carbon_target_kg_co2 decimal(15,2),
  current_carbon_kg_co2 decimal(15,2) DEFAULT 0,
  reduction_target_percent decimal(5,2),
  baseline_date date,
  target_date date,
  renewable_energy_target_percent decimal(5,2),
  current_renewable_percent decimal(5,2) DEFAULT 0,
  waste_reduction_target_percent decimal(5,2),
  current_waste_reduction_percent decimal(5,2) DEFAULT 0,
  water_usage_target_liters decimal(15,2),
  current_water_usage_liters decimal(15,2) DEFAULT 0,
  tracking_frequency text DEFAULT 'monthly' CHECK (tracking_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
  metrics jsonb DEFAULT '{}'::jsonb,
  esg_scores jsonb DEFAULT '{}'::jsonb,
  certifications jsonb DEFAULT '[]'::jsonb,
  reporting_standards jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'planning', 'on_hold', 'completed')),
  progress_percentage decimal(5,2) DEFAULT 0,
  ecp_id uuid REFERENCES ecosystem_contexts(id),
  created_by uuid REFERENCES user_profiles(id),
  updated_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agent coordination configs table
CREATE TABLE IF NOT EXISTS agent_coordination_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  config_name text NOT NULL,
  description text,
  coordination_strategy text NOT NULL CHECK (coordination_strategy IN ('centralized', 'decentralized', 'hierarchical', 'federated')),
  agent_registry jsonb DEFAULT '[]'::jsonb,
  communication_protocols jsonb DEFAULT '[]'::jsonb,
  routing_rules jsonb DEFAULT '{}'::jsonb,
  load_balancing jsonb DEFAULT '{}'::jsonb,
  failover_config jsonb DEFAULT '{}'::jsonb,
  health_monitoring jsonb DEFAULT '{}'::jsonb,
  performance_metrics jsonb DEFAULT '{}'::jsonb,
  scaling_rules jsonb DEFAULT '{}'::jsonb,
  max_concurrent_agents int DEFAULT 10,
  timeout_seconds int DEFAULT 300,
  retry_policy jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'testing')),
  acp_ids jsonb DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES user_profiles(id),
  updated_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create model registry table
CREATE TABLE IF NOT EXISTS model_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  model_name text NOT NULL,
  model_type text NOT NULL CHECK (model_type IN ('arima', 'prophet', 'state_space', 'agentic_twin', 'llm', 'custom')),
  version text NOT NULL,
  description text,
  framework text,
  model_file_path text,
  model_config jsonb DEFAULT '{}'::jsonb,
  training_data_source text,
  training_parameters jsonb DEFAULT '{}'::jsonb,
  performance_metrics jsonb DEFAULT '{}'::jsonb,
  deployment_status text DEFAULT 'registered' CHECK (deployment_status IN ('registered', 'training', 'trained', 'deployed', 'deprecated')),
  deployment_environment text,
  endpoint_url text,
  input_schema jsonb DEFAULT '{}'::jsonb,
  output_schema jsonb DEFAULT '{}'::jsonb,
  dependencies jsonb DEFAULT '[]'::jsonb,
  hardware_requirements jsonb DEFAULT '{}'::jsonb,
  license_info text,
  tags jsonb DEFAULT '[]'::jsonb,
  integration_status text DEFAULT 'pending' CHECK (integration_status IN ('pending', 'in_progress', 'integrated', 'failed')),
  last_trained_at timestamptz,
  deployed_at timestamptz,
  created_by uuid REFERENCES user_profiles(id),
  updated_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create testing sessions table for integration/pen testing
CREATE TABLE IF NOT EXISTS testing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  session_name text NOT NULL,
  testing_type text NOT NULL CHECK (testing_type IN ('integration', 'penetration', 'load', 'security', 'functional', 'regression')),
  environment_id uuid REFERENCES deployment_environments(id),
  test_plan jsonb DEFAULT '{}'::jsonb,
  test_cases jsonb DEFAULT '[]'::jsonb,
  results jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'failed', 'cancelled')),
  start_time timestamptz,
  end_time timestamptz,
  duration_minutes int,
  pass_rate decimal(5,2),
  critical_issues int DEFAULT 0,
  high_issues int DEFAULT 0,
  medium_issues int DEFAULT 0,
  low_issues int DEFAULT 0,
  recommendations jsonb DEFAULT '[]'::jsonb,
  executed_by uuid REFERENCES user_profiles(id),
  reviewed_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deployment_environments_workspace ON deployment_environments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_deployment_environments_status ON deployment_environments(status);
CREATE INDEX IF NOT EXISTS idx_business_automations_workspace ON business_automations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_business_automations_status ON business_automations(status);
CREATE INDEX IF NOT EXISTS idx_compliance_workflows_workspace ON compliance_workflows(workspace_id);
CREATE INDEX IF NOT EXISTS idx_compliance_workflows_type ON compliance_workflows(compliance_type);
CREATE INDEX IF NOT EXISTS idx_sustainability_operations_workspace ON sustainability_operations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agent_coordination_configs_workspace ON agent_coordination_configs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_model_registry_workspace ON model_registry(workspace_id);
CREATE INDEX IF NOT EXISTS idx_model_registry_type ON model_registry(model_type);
CREATE INDEX IF NOT EXISTS idx_model_registry_status ON model_registry(deployment_status);
CREATE INDEX IF NOT EXISTS idx_testing_sessions_workspace ON testing_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_testing_sessions_environment ON testing_sessions(environment_id);

-- Enable RLS
ALTER TABLE deployment_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE sustainability_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_coordination_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE testing_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (same pattern for all tables)
CREATE POLICY "Users can view records in their workspaces"
  ON deployment_environments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = deployment_environments.workspace_id AND workspace_members.user_id = auth.uid()));

CREATE POLICY "Users can create records in their workspaces"
  ON deployment_environments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = deployment_environments.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));

CREATE POLICY "Users can update records in their workspaces"
  ON deployment_environments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = deployment_environments.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')))
  WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = deployment_environments.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));

CREATE POLICY "Users can delete records in their workspaces"
  ON deployment_environments FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = deployment_environments.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin')));

-- Repeat policies for other tables
CREATE POLICY "Users can view business automations" ON business_automations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = business_automations.workspace_id AND workspace_members.user_id = auth.uid()));
CREATE POLICY "Users can create business automations" ON business_automations FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = business_automations.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));
CREATE POLICY "Users can update business automations" ON business_automations FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = business_automations.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member'))) WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = business_automations.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));
CREATE POLICY "Users can delete business automations" ON business_automations FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = business_automations.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin')));

CREATE POLICY "Users can view compliance workflows" ON compliance_workflows FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = compliance_workflows.workspace_id AND workspace_members.user_id = auth.uid()));
CREATE POLICY "Users can create compliance workflows" ON compliance_workflows FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = compliance_workflows.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));
CREATE POLICY "Users can update compliance workflows" ON compliance_workflows FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = compliance_workflows.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member'))) WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = compliance_workflows.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));
CREATE POLICY "Users can delete compliance workflows" ON compliance_workflows FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = compliance_workflows.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin')));

CREATE POLICY "Users can view sustainability operations" ON sustainability_operations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = sustainability_operations.workspace_id AND workspace_members.user_id = auth.uid()));
CREATE POLICY "Users can create sustainability operations" ON sustainability_operations FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = sustainability_operations.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));
CREATE POLICY "Users can update sustainability operations" ON sustainability_operations FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = sustainability_operations.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member'))) WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = sustainability_operations.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));
CREATE POLICY "Users can delete sustainability operations" ON sustainability_operations FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = sustainability_operations.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin')));

CREATE POLICY "Users can view agent configs" ON agent_coordination_configs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = agent_coordination_configs.workspace_id AND workspace_members.user_id = auth.uid()));
CREATE POLICY "Users can create agent configs" ON agent_coordination_configs FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = agent_coordination_configs.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));
CREATE POLICY "Users can update agent configs" ON agent_coordination_configs FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = agent_coordination_configs.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member'))) WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = agent_coordination_configs.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));
CREATE POLICY "Users can delete agent configs" ON agent_coordination_configs FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = agent_coordination_configs.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin')));

CREATE POLICY "Users can view models" ON model_registry FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = model_registry.workspace_id AND workspace_members.user_id = auth.uid()));
CREATE POLICY "Users can create models" ON model_registry FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = model_registry.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));
CREATE POLICY "Users can update models" ON model_registry FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = model_registry.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member'))) WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = model_registry.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));
CREATE POLICY "Users can delete models" ON model_registry FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = model_registry.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin')));

CREATE POLICY "Users can view testing sessions" ON testing_sessions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = testing_sessions.workspace_id AND workspace_members.user_id = auth.uid()));
CREATE POLICY "Users can create testing sessions" ON testing_sessions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = testing_sessions.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));
CREATE POLICY "Users can update testing sessions" ON testing_sessions FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = testing_sessions.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member'))) WITH CHECK (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = testing_sessions.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));

-- Triggers
DROP TRIGGER IF EXISTS update_deployment_environments_updated_at ON deployment_environments;
CREATE TRIGGER update_deployment_environments_updated_at BEFORE UPDATE ON deployment_environments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_business_automations_updated_at ON business_automations;
CREATE TRIGGER update_business_automations_updated_at BEFORE UPDATE ON business_automations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_compliance_workflows_updated_at ON compliance_workflows;
CREATE TRIGGER update_compliance_workflows_updated_at BEFORE UPDATE ON compliance_workflows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_sustainability_operations_updated_at ON sustainability_operations;
CREATE TRIGGER update_sustainability_operations_updated_at BEFORE UPDATE ON sustainability_operations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_agent_coordination_configs_updated_at ON agent_coordination_configs;
CREATE TRIGGER update_agent_coordination_configs_updated_at BEFORE UPDATE ON agent_coordination_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_model_registry_updated_at ON model_registry;
CREATE TRIGGER update_model_registry_updated_at BEFORE UPDATE ON model_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_testing_sessions_updated_at ON testing_sessions;
CREATE TRIGGER update_testing_sessions_updated_at BEFORE UPDATE ON testing_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
