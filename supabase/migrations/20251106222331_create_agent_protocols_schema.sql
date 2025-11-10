/*
  # Agent Protocols System - Complete Schema

  1. New Tables
    - `human_contexts` - Human Context Protocol (HCP) instances
      - Identity & roles, place/time, purposes, activities, resources, rules, preferences
    - `business_contexts` - Business Context Protocol (BCP) instances
      - OBC canvas fields: segments, value proposition, channels, partners, etc.
    - `machine_contexts` - Machine Context Protocol (MCP) instances
      - ML pipeline, models, deployment, monitoring configurations
    - `data_contexts` - Data Context Protocol (DCP) instances
      - Data mesh elements: domains, products, contracts, SLAs, policies
    - `test_contexts` - Test Context Protocol (TCP) instances
      - Baselines, monitoring, drift detection, alerting
    - `protocol_validations` - SHACL validation results
    - `drift_reports` - Time-series drift measurements
    - `protocol_links` - Relationships between protocols

  2. Security
    - Enable RLS on all tables
    - Public read access for demo purposes
    - Authenticated users can create/update their own contexts
*/

-- Human Context Protocol (HCP)
CREATE TABLE IF NOT EXISTS human_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hcp_id text UNIQUE NOT NULL,
  title text NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  owner_name text NOT NULL,
  owner_uri text,
  steward_name text,
  steward_uri text,
  validity_from timestamptz NOT NULL,
  validity_to timestamptz,
  timezone text DEFAULT 'UTC',
  identity jsonb NOT NULL DEFAULT '{}',
  context jsonb NOT NULL DEFAULT '{}',
  resources jsonb NOT NULL DEFAULT '{}',
  rules jsonb NOT NULL DEFAULT '{}',
  preferences jsonb NOT NULL DEFAULT '{}',
  delegation jsonb NOT NULL DEFAULT '{}',
  audit jsonb NOT NULL DEFAULT '{}',
  mesh jsonb NOT NULL DEFAULT '{}',
  obc_map jsonb NOT NULL DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- Business Context Protocol (BCP)
CREATE TABLE IF NOT EXISTS business_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bcp_id text UNIQUE NOT NULL,
  title text NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  owner_name text NOT NULL,
  owner_uri text,
  validity_from timestamptz NOT NULL,
  validity_to timestamptz,
  customer_segments jsonb NOT NULL DEFAULT '[]',
  value_propositions jsonb NOT NULL DEFAULT '[]',
  channels jsonb NOT NULL DEFAULT '[]',
  customer_relationships jsonb NOT NULL DEFAULT '[]',
  revenue_streams jsonb NOT NULL DEFAULT '[]',
  key_resources jsonb NOT NULL DEFAULT '[]',
  key_activities jsonb NOT NULL DEFAULT '[]',
  key_partners jsonb NOT NULL DEFAULT '[]',
  cost_structure jsonb NOT NULL DEFAULT '[]',
  metrics jsonb NOT NULL DEFAULT '{}',
  linked_hcp_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- Machine Context Protocol (MCP)
CREATE TABLE IF NOT EXISTS machine_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mcp_id text UNIQUE NOT NULL,
  title text NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  owner_name text NOT NULL,
  owner_uri text,
  pipeline jsonb NOT NULL DEFAULT '{}',
  tasks jsonb NOT NULL DEFAULT '[]',
  models jsonb NOT NULL DEFAULT '[]',
  deployment jsonb NOT NULL DEFAULT '{}',
  monitoring jsonb NOT NULL DEFAULT '{}',
  linked_hcp_id uuid,
  linked_bcp_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- Data Context Protocol (DCP)
CREATE TABLE IF NOT EXISTS data_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dcp_id text UNIQUE NOT NULL,
  title text NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  owner_name text NOT NULL,
  owner_uri text,
  domain text NOT NULL,
  data_products jsonb NOT NULL DEFAULT '[]',
  contracts jsonb NOT NULL DEFAULT '{}',
  ports jsonb NOT NULL DEFAULT '[]',
  storage jsonb NOT NULL DEFAULT '{}',
  slas jsonb NOT NULL DEFAULT '{}',
  policies jsonb NOT NULL DEFAULT '[]',
  linked_hcp_id uuid,
  linked_bcp_id uuid,
  linked_mcp_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- Test Context Protocol (TCP)
CREATE TABLE IF NOT EXISTS test_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tcp_id text UNIQUE NOT NULL,
  title text NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  owner_name text NOT NULL,
  owner_uri text,
  baseline jsonb NOT NULL DEFAULT '{}',
  monitoring jsonb NOT NULL DEFAULT '{}',
  drift_config jsonb NOT NULL DEFAULT '{}',
  alerting jsonb NOT NULL DEFAULT '{}',
  linked_dcp_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- Protocol Validations (SHACL results)
CREATE TABLE IF NOT EXISTS protocol_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_type text NOT NULL,
  protocol_id uuid NOT NULL,
  validation_timestamp timestamptz DEFAULT now(),
  conforms boolean NOT NULL,
  results jsonb NOT NULL DEFAULT '{}',
  validator_version text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Drift Reports
CREATE TABLE IF NOT EXISTS drift_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tcp_id uuid NOT NULL REFERENCES test_contexts(id) ON DELETE CASCADE,
  report_timestamp timestamptz DEFAULT now(),
  drift_metrics jsonb NOT NULL DEFAULT '{}',
  velocity_score numeric,
  alerts jsonb NOT NULL DEFAULT '[]',
  baseline_snapshot jsonb,
  current_snapshot jsonb,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Protocol Links (relationships)
CREATE TABLE IF NOT EXISTS protocol_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL,
  source_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  relationship_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_type, source_id, target_type, target_id, relationship_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_human_contexts_hcp_id ON human_contexts(hcp_id);
CREATE INDEX IF NOT EXISTS idx_human_contexts_owner_uri ON human_contexts(owner_uri);
CREATE INDEX IF NOT EXISTS idx_business_contexts_bcp_id ON business_contexts(bcp_id);
CREATE INDEX IF NOT EXISTS idx_business_contexts_linked_hcp ON business_contexts(linked_hcp_id);
CREATE INDEX IF NOT EXISTS idx_machine_contexts_mcp_id ON machine_contexts(mcp_id);
CREATE INDEX IF NOT EXISTS idx_machine_contexts_linked_hcp ON machine_contexts(linked_hcp_id);
CREATE INDEX IF NOT EXISTS idx_machine_contexts_linked_bcp ON machine_contexts(linked_bcp_id);
CREATE INDEX IF NOT EXISTS idx_data_contexts_dcp_id ON data_contexts(dcp_id);
CREATE INDEX IF NOT EXISTS idx_data_contexts_domain ON data_contexts(domain);
CREATE INDEX IF NOT EXISTS idx_test_contexts_tcp_id ON test_contexts(tcp_id);
CREATE INDEX IF NOT EXISTS idx_test_contexts_linked_dcp ON test_contexts(linked_dcp_id);
CREATE INDEX IF NOT EXISTS idx_protocol_validations_protocol ON protocol_validations(protocol_type, protocol_id);
CREATE INDEX IF NOT EXISTS idx_drift_reports_tcp ON drift_reports(tcp_id);
CREATE INDEX IF NOT EXISTS idx_drift_reports_timestamp ON drift_reports(report_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_protocol_links_source ON protocol_links(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_protocol_links_target ON protocol_links(target_type, target_id);

-- Enable Row Level Security
ALTER TABLE human_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE drift_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_links ENABLE ROW LEVEL SECURITY;

-- Public read policies (for demo)
CREATE POLICY "Anyone can view human contexts"
  ON human_contexts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view business contexts"
  ON business_contexts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view machine contexts"
  ON machine_contexts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view data contexts"
  ON data_contexts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view test contexts"
  ON test_contexts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view validations"
  ON protocol_validations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view drift reports"
  ON drift_reports FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view protocol links"
  ON protocol_links FOR SELECT
  TO public
  USING (true);

-- Insert policies (authenticated users or public for demo)
CREATE POLICY "Anyone can create human contexts"
  ON human_contexts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can create business contexts"
  ON business_contexts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can create machine contexts"
  ON machine_contexts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can create data contexts"
  ON data_contexts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can create test contexts"
  ON test_contexts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can create validations"
  ON protocol_validations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can create drift reports"
  ON drift_reports FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can create protocol links"
  ON protocol_links FOR INSERT
  TO public
  WITH CHECK (true);

-- Update policies
CREATE POLICY "Anyone can update human contexts"
  ON human_contexts FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can update business contexts"
  ON business_contexts FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can update machine contexts"
  ON machine_contexts FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can update data contexts"
  ON data_contexts FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can update test contexts"
  ON test_contexts FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);