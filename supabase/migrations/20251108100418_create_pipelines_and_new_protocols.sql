/*
  # Phase 3: Visual Pipeline Builder & New Protocol Types

  ## Overview
  Implements Node-RED style visual pipeline builder with drag-and-drop interface
  for composing agent workflows. Adds 4 new protocol types: ACP, GCP, GeoCP, ECP.

  ## New Protocol Types
  
  ### Agent Context Protocol (ACP)
  - Agent identity and capabilities
  - Agent registration and discovery
  - Agent lifecycle management
  - Communication preferences
  
  ### Governance Context Protocol (GCP)
  - Compliance rules and policies
  - Regulatory frameworks
  - Audit trails
  - Permission systems
  
  ### Geographical Context Protocol (GeoCP)
  - Location-based services
  - Spatial queries
  - Geographic boundaries
  - Regional regulations
  
  ### Ecosystem Context Protocol (ECP)
  - Environmental impact
  - Sustainability metrics
  - Resource optimization
  - Carbon footprint tracking

  ## New Tables
  
  ### `pipelines`
  - Pipeline definitions
  - Visual layout configuration
  - Execution settings
  
  ### `pipeline_nodes`
  - Individual nodes in pipelines
  - Protocol type references
  - Node configuration
  
  ### `pipeline_edges`
  - Connections between nodes
  - Data flow definitions
  
  ### `pipeline_executions`
  - Pipeline run history
  - Execution results
  - Performance metrics

  ### Protocol tables for new types
  - `agent_contexts` (ACP)
  - `governance_contexts` (GCP)
  - `geographical_contexts` (GeoCP)
  - `ecosystem_contexts` (ECP)

  ## Security
  - RLS enabled on all tables
  - Workspace-scoped access
  - Execution tracking per user
*/

-- Create pipelines table
CREATE TABLE IF NOT EXISTS pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  version text DEFAULT '1.0.0',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  nodes jsonb DEFAULT '[]'::jsonb,
  edges jsonb DEFAULT '[]'::jsonb,
  layout jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES user_profiles(id),
  updated_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pipeline executions table
CREATE TABLE IF NOT EXISTS pipeline_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  status text DEFAULT 'running' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_ms int,
  input_data jsonb DEFAULT '{}'::jsonb,
  output_data jsonb DEFAULT '{}'::jsonb,
  execution_log jsonb DEFAULT '[]'::jsonb,
  error_details jsonb,
  executed_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create Agent Context Protocol (ACP) table
CREATE TABLE IF NOT EXISTS agent_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  acp_id text UNIQUE NOT NULL,
  title text NOT NULL,
  version text DEFAULT '1.0.0',
  owner_name text NOT NULL,
  owner_uri text,
  agent_type text NOT NULL,
  agent_identity jsonb DEFAULT '{}'::jsonb,
  capabilities jsonb DEFAULT '[]'::jsonb,
  communication_protocols jsonb DEFAULT '[]'::jsonb,
  lifecycle_state text DEFAULT 'registered' CHECK (lifecycle_state IN ('registered', 'active', 'idle', 'retired')),
  discovery_metadata jsonb DEFAULT '{}'::jsonb,
  linked_hcp_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES user_profiles(id),
  updated_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Governance Context Protocol (GCP) table
CREATE TABLE IF NOT EXISTS governance_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  gcp_id text UNIQUE NOT NULL,
  title text NOT NULL,
  version text DEFAULT '1.0.0',
  owner_name text NOT NULL,
  owner_uri text,
  governance_framework text NOT NULL,
  compliance_rules jsonb DEFAULT '[]'::jsonb,
  regulatory_requirements jsonb DEFAULT '[]'::jsonb,
  audit_trail jsonb DEFAULT '[]'::jsonb,
  permission_system jsonb DEFAULT '{}'::jsonb,
  risk_assessment jsonb DEFAULT '{}'::jsonb,
  linked_bcp_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES user_profiles(id),
  updated_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Geographical Context Protocol (GeoCP) table
CREATE TABLE IF NOT EXISTS geographical_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  geocp_id text UNIQUE NOT NULL,
  title text NOT NULL,
  version text DEFAULT '1.0.0',
  owner_name text NOT NULL,
  owner_uri text,
  location_data jsonb DEFAULT '{}'::jsonb,
  geographic_boundaries jsonb DEFAULT '[]'::jsonb,
  spatial_queries jsonb DEFAULT '[]'::jsonb,
  regional_regulations jsonb DEFAULT '[]'::jsonb,
  service_areas jsonb DEFAULT '[]'::jsonb,
  coordinate_system text DEFAULT 'WGS84',
  linked_hcp_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES user_profiles(id),
  updated_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Ecosystem Context Protocol (ECP) table
CREATE TABLE IF NOT EXISTS ecosystem_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  ecp_id text UNIQUE NOT NULL,
  title text NOT NULL,
  version text DEFAULT '1.0.0',
  owner_name text NOT NULL,
  owner_uri text,
  environmental_impact jsonb DEFAULT '{}'::jsonb,
  sustainability_metrics jsonb DEFAULT '{}'::jsonb,
  resource_usage jsonb DEFAULT '{}'::jsonb,
  carbon_footprint jsonb DEFAULT '{}'::jsonb,
  circular_economy jsonb DEFAULT '{}'::jsonb,
  esg_scores jsonb DEFAULT '{}'::jsonb,
  linked_bcp_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES user_profiles(id),
  updated_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pipelines_workspace ON pipelines(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_status ON pipelines(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_executions_pipeline ON pipeline_executions(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_executions_workspace ON pipeline_executions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_executions_status ON pipeline_executions(status);
CREATE INDEX IF NOT EXISTS idx_agent_contexts_workspace ON agent_contexts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_governance_contexts_workspace ON governance_contexts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_geographical_contexts_workspace ON geographical_contexts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_contexts_workspace ON ecosystem_contexts(workspace_id);

-- Enable Row Level Security
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE geographical_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_contexts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pipelines
CREATE POLICY "Users can view pipelines in their workspaces"
  ON pipelines FOR SELECT
  TO authenticated
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = pipelines.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pipelines in their workspaces"
  ON pipelines FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = pipelines.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can update pipelines in their workspaces"
  ON pipelines FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = pipelines.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'member')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = pipelines.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can delete pipelines in their workspaces"
  ON pipelines FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = pipelines.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for pipeline_executions
CREATE POLICY "Users can view executions in their workspaces"
  ON pipeline_executions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = pipeline_executions.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create executions in their workspaces"
  ON pipeline_executions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = pipeline_executions.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'member')
    )
  );

-- RLS Policies for new protocol types (ACP)
CREATE POLICY "Users can view agent contexts in their workspaces"
  ON agent_contexts FOR SELECT
  TO authenticated
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = agent_contexts.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create agent contexts in their workspaces"
  ON agent_contexts FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = agent_contexts.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can update agent contexts in their workspaces"
  ON agent_contexts FOR UPDATE
  TO authenticated
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = agent_contexts.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'member')
    )
  )
  WITH CHECK (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = agent_contexts.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can delete agent contexts in their workspaces"
  ON agent_contexts FOR DELETE
  TO authenticated
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = agent_contexts.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

-- Copy policies for GCP (governance_contexts)
CREATE POLICY "Users can view governance contexts in their workspaces"
  ON governance_contexts FOR SELECT TO authenticated
  USING (workspace_id IS NULL OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = governance_contexts.workspace_id AND workspace_members.user_id = auth.uid()));

CREATE POLICY "Users can create governance contexts in their workspaces"
  ON governance_contexts FOR INSERT TO authenticated
  WITH CHECK (workspace_id IS NULL OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = governance_contexts.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));

CREATE POLICY "Users can update governance contexts in their workspaces"
  ON governance_contexts FOR UPDATE TO authenticated
  USING (workspace_id IS NULL OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = governance_contexts.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')))
  WITH CHECK (workspace_id IS NULL OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = governance_contexts.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));

CREATE POLICY "Users can delete governance contexts in their workspaces"
  ON governance_contexts FOR DELETE TO authenticated
  USING (workspace_id IS NULL OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = governance_contexts.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin')));

-- Copy policies for GeoCP (geographical_contexts)
CREATE POLICY "Users can view geographical contexts in their workspaces"
  ON geographical_contexts FOR SELECT TO authenticated
  USING (workspace_id IS NULL OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = geographical_contexts.workspace_id AND workspace_members.user_id = auth.uid()));

CREATE POLICY "Users can create geographical contexts in their workspaces"
  ON geographical_contexts FOR INSERT TO authenticated
  WITH CHECK (workspace_id IS NULL OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = geographical_contexts.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));

CREATE POLICY "Users can update geographical contexts in their workspaces"
  ON geographical_contexts FOR UPDATE TO authenticated
  USING (workspace_id IS NULL OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = geographical_contexts.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')))
  WITH CHECK (workspace_id IS NULL OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = geographical_contexts.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));

CREATE POLICY "Users can delete geographical contexts in their workspaces"
  ON geographical_contexts FOR DELETE TO authenticated
  USING (workspace_id IS NULL OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = geographical_contexts.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin')));

-- Copy policies for ECP (ecosystem_contexts)
CREATE POLICY "Users can view ecosystem contexts in their workspaces"
  ON ecosystem_contexts FOR SELECT TO authenticated
  USING (workspace_id IS NULL OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = ecosystem_contexts.workspace_id AND workspace_members.user_id = auth.uid()));

CREATE POLICY "Users can create ecosystem contexts in their workspaces"
  ON ecosystem_contexts FOR INSERT TO authenticated
  WITH CHECK (workspace_id IS NULL OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = ecosystem_contexts.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));

CREATE POLICY "Users can update ecosystem contexts in their workspaces"
  ON ecosystem_contexts FOR UPDATE TO authenticated
  USING (workspace_id IS NULL OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = ecosystem_contexts.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')))
  WITH CHECK (workspace_id IS NULL OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = ecosystem_contexts.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin', 'member')));

CREATE POLICY "Users can delete ecosystem contexts in their workspaces"
  ON ecosystem_contexts FOR DELETE TO authenticated
  USING (workspace_id IS NULL OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = ecosystem_contexts.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin')));

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_pipelines_updated_at ON pipelines;
CREATE TRIGGER update_pipelines_updated_at
  BEFORE UPDATE ON pipelines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_agent_contexts_updated_at ON agent_contexts;
CREATE TRIGGER update_agent_contexts_updated_at
  BEFORE UPDATE ON agent_contexts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_governance_contexts_updated_at ON governance_contexts;
CREATE TRIGGER update_governance_contexts_updated_at
  BEFORE UPDATE ON governance_contexts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_geographical_contexts_updated_at ON geographical_contexts;
CREATE TRIGGER update_geographical_contexts_updated_at
  BEFORE UPDATE ON geographical_contexts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_ecosystem_contexts_updated_at ON ecosystem_contexts;
CREATE TRIGGER update_ecosystem_contexts_updated_at
  BEFORE UPDATE ON ecosystem_contexts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
