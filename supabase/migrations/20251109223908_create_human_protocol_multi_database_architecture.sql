/*
  # Human Protocol Multi-Database Architecture
  
  ## Overview
  This migration establishes a comprehensive four-database architecture for each user
  at the Human Protocol (HCP) level, supporting different data types and use cases.
  
  ## Four Database Layers
  
  ### 1. PostgreSQL (SQL) - Demographics & Access Control
     - Core user demographics and identity
     - Access privileges and permissions
     - ODOO ERP integration preparation
     - Traditional relational data
  
  ### 2. Graph Database (RDF) - Medical Records & Complex Relationships
     - FHIR medical record graphs
     - Complex multi-entity relationships
     - Large interconnected datasets
     - RDF/triple store format
  
  ### 3. Blockchain (Parachain) - Smart Contracts (Optional)
     - Personal blockchain profile
     - Smart contract capabilities
     - Decentralized identity verification
     - Immutable audit trails
  
  ### 4. NoSQL Document Store - Archives & References (Optional)
     - Document archives
     - Zotero reference integration
     - Unstructured document storage
     - Large document collections
  
  ## Implementation
*/

-- ============================================================================
-- 1. POSTGRESQL LAYER: Demographics & Access Control
-- ============================================================================

-- Human Protocol User Profile (Core Demographics)
CREATE TABLE IF NOT EXISTS hcp_user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  given_name text NOT NULL,
  family_name text NOT NULL,
  middle_names text[],
  preferred_name text,
  
  -- Demographics
  date_of_birth date NOT NULL,
  gender text,
  nationality text,
  languages text[],
  
  -- Contact
  email text NOT NULL,
  phone text,
  address jsonb,
  emergency_contact jsonb,
  
  -- Professional
  occupation text,
  employer text,
  professional_licenses jsonb[],
  
  -- System
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  
  UNIQUE(user_id)
);

-- Access Control & Permissions
CREATE TABLE IF NOT EXISTS hcp_access_control (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES hcp_user_profiles(id) ON DELETE CASCADE,
  
  -- Access Levels
  role text NOT NULL DEFAULT 'user',
  permissions jsonb DEFAULT '[]'::jsonb,
  restrictions jsonb DEFAULT '[]'::jsonb,
  
  -- Database Access
  sql_access_level text DEFAULT 'read',
  graph_access_level text DEFAULT 'read',
  blockchain_enabled boolean DEFAULT false,
  nosql_enabled boolean DEFAULT false,
  
  -- Resource Limits
  storage_quota_gb integer DEFAULT 10,
  storage_used_gb numeric(10,2) DEFAULT 0,
  api_rate_limit integer DEFAULT 1000,
  
  -- Audit
  last_access timestamptz,
  access_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(profile_id)
);

-- ODOO ERP Integration Configuration
CREATE TABLE IF NOT EXISTS hcp_odoo_integration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES hcp_user_profiles(id) ON DELETE CASCADE,
  
  -- ODOO Connection
  odoo_instance_url text,
  odoo_database_name text,
  odoo_user_id integer,
  odoo_api_key_encrypted text,
  
  -- Sync Configuration
  sync_enabled boolean DEFAULT false,
  sync_frequency text DEFAULT 'daily',
  last_sync timestamptz,
  sync_status text,
  
  -- Module Access
  enabled_modules text[],
  custom_fields jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  
  UNIQUE(profile_id)
);

-- ============================================================================
-- 2. GRAPH DATABASE LAYER: RDF & Medical Records
-- ============================================================================

-- Graph Database Configuration
CREATE TABLE IF NOT EXISTS hcp_graph_databases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES hcp_user_profiles(id) ON DELETE CASCADE,
  
  -- Graph Identity
  graph_name text NOT NULL,
  graph_type text DEFAULT 'rdf',
  graph_uri text,
  
  -- Configuration
  triple_store_backend text DEFAULT 'native',
  reasoning_enabled boolean DEFAULT false,
  inference_rules jsonb DEFAULT '[]'::jsonb,
  
  -- Statistics
  triple_count bigint DEFAULT 0,
  entity_count integer DEFAULT 0,
  edge_count integer DEFAULT 0,
  
  -- Performance
  indexed_properties text[],
  cache_enabled boolean DEFAULT true,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_queried timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  UNIQUE(profile_id, graph_name)
);

-- RDF Triple Store (for medical records and complex relationships)
CREATE TABLE IF NOT EXISTS hcp_rdf_triples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  graph_id uuid REFERENCES hcp_graph_databases(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES hcp_user_profiles(id) ON DELETE CASCADE,
  
  -- RDF Triple Components
  subject text NOT NULL,
  predicate text NOT NULL,
  object text NOT NULL,
  object_type text DEFAULT 'literal',
  
  -- Context
  named_graph text,
  context jsonb,
  
  -- Provenance
  source text,
  confidence numeric(3,2) DEFAULT 1.0,
  
  -- Temporal
  valid_from timestamptz DEFAULT now(),
  valid_to timestamptz,
  
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Graph Query Cache
CREATE TABLE IF NOT EXISTS hcp_graph_query_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  graph_id uuid REFERENCES hcp_graph_databases(id) ON DELETE CASCADE,
  
  query_hash text NOT NULL,
  query_text text NOT NULL,
  result jsonb,
  
  hit_count integer DEFAULT 0,
  last_hit timestamptz,
  
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  
  UNIQUE(graph_id, query_hash)
);

-- ============================================================================
-- 3. BLOCKCHAIN LAYER: Parachain Integration (Optional)
-- ============================================================================

-- Blockchain Profile Configuration
CREATE TABLE IF NOT EXISTS hcp_blockchain_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES hcp_user_profiles(id) ON DELETE CASCADE,
  
  -- Blockchain Identity
  chain_type text DEFAULT 'parachain',
  chain_id text,
  wallet_address text,
  public_key text,
  
  -- DID (Decentralized Identifier)
  did text,
  did_document jsonb,
  
  -- Smart Contract Access
  contract_addresses jsonb DEFAULT '[]'::jsonb,
  contract_abi jsonb,
  
  -- Status
  verified boolean DEFAULT false,
  verification_method text,
  verified_at timestamptz,
  
  -- Security
  encryption_method text DEFAULT 'ed25519',
  key_derivation_path text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  
  UNIQUE(profile_id)
);

-- Smart Contract Interactions
CREATE TABLE IF NOT EXISTS hcp_smart_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blockchain_profile_id uuid REFERENCES hcp_blockchain_profiles(id) ON DELETE CASCADE,
  
  -- Contract Details
  contract_address text NOT NULL,
  contract_type text,
  contract_name text,
  
  -- Interaction
  function_name text,
  parameters jsonb,
  transaction_hash text,
  
  -- Status
  status text DEFAULT 'pending',
  gas_used numeric,
  block_number bigint,
  
  -- Result
  success boolean,
  return_value jsonb,
  error_message text,
  
  created_at timestamptz DEFAULT now(),
  executed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Blockchain Audit Trail
CREATE TABLE IF NOT EXISTS hcp_blockchain_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blockchain_profile_id uuid REFERENCES hcp_blockchain_profiles(id) ON DELETE CASCADE,
  
  action_type text NOT NULL,
  action_data jsonb,
  transaction_hash text,
  block_number bigint,
  
  immutable_proof text,
  timestamp timestamptz DEFAULT now(),
  
  metadata jsonb DEFAULT '{}'::jsonb
);

-- ============================================================================
-- 4. NOSQL DOCUMENT STORE LAYER: Archives & References (Optional)
-- ============================================================================

-- Document Store Configuration
CREATE TABLE IF NOT EXISTS hcp_document_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES hcp_user_profiles(id) ON DELETE CASCADE,
  
  -- Store Configuration
  store_name text NOT NULL,
  store_type text DEFAULT 'document_archive',
  
  -- Integration
  zotero_integration boolean DEFAULT false,
  zotero_library_id text,
  zotero_api_key_encrypted text,
  
  -- Capacity
  document_count integer DEFAULT 0,
  total_size_mb numeric(10,2) DEFAULT 0,
  
  -- Settings
  auto_index boolean DEFAULT true,
  full_text_search boolean DEFAULT true,
  version_control boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  
  UNIQUE(profile_id, store_name)
);

-- Document Archive
CREATE TABLE IF NOT EXISTS hcp_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES hcp_document_stores(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES hcp_user_profiles(id) ON DELETE CASCADE,
  
  -- Document Identity
  document_title text NOT NULL,
  document_type text,
  content_type text,
  
  -- Content
  content jsonb,
  content_text text,
  content_url text,
  
  -- Metadata
  authors text[],
  publication_date date,
  doi text,
  isbn text,
  tags text[],
  
  -- Zotero Integration
  zotero_item_key text,
  zotero_item_version integer,
  zotero_synced_at timestamptz,
  
  -- File Info
  file_size_mb numeric(10,2),
  file_hash text,
  
  -- Search
  search_vector tsvector,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Document Citations & References
CREATE TABLE IF NOT EXISTS hcp_document_citations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citing_document_id uuid REFERENCES hcp_documents(id) ON DELETE CASCADE,
  cited_document_id uuid REFERENCES hcp_documents(id) ON DELETE CASCADE,
  
  citation_text text,
  citation_context text,
  page_number integer,
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(citing_document_id, cited_document_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- PostgreSQL Layer Indexes
CREATE INDEX IF NOT EXISTS idx_hcp_user_profiles_user_id ON hcp_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_hcp_user_profiles_email ON hcp_user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_hcp_access_control_profile_id ON hcp_access_control(profile_id);

-- Graph Layer Indexes
CREATE INDEX IF NOT EXISTS idx_hcp_rdf_triples_graph_id ON hcp_rdf_triples(graph_id);
CREATE INDEX IF NOT EXISTS idx_hcp_rdf_triples_profile_id ON hcp_rdf_triples(profile_id);
CREATE INDEX IF NOT EXISTS idx_hcp_rdf_triples_subject ON hcp_rdf_triples(subject);
CREATE INDEX IF NOT EXISTS idx_hcp_rdf_triples_predicate ON hcp_rdf_triples(predicate);
CREATE INDEX IF NOT EXISTS idx_hcp_rdf_triples_spo ON hcp_rdf_triples(subject, predicate, object);

-- Blockchain Layer Indexes
CREATE INDEX IF NOT EXISTS idx_hcp_blockchain_profiles_profile_id ON hcp_blockchain_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_hcp_blockchain_profiles_wallet ON hcp_blockchain_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_hcp_smart_contracts_blockchain_profile ON hcp_smart_contracts(blockchain_profile_id);

-- Document Layer Indexes
CREATE INDEX IF NOT EXISTS idx_hcp_documents_store_id ON hcp_documents(store_id);
CREATE INDEX IF NOT EXISTS idx_hcp_documents_profile_id ON hcp_documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_hcp_documents_zotero_key ON hcp_documents(zotero_item_key);
CREATE INDEX IF NOT EXISTS idx_hcp_documents_search ON hcp_documents USING gin(search_vector);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE hcp_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hcp_access_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE hcp_odoo_integration ENABLE ROW LEVEL SECURITY;
ALTER TABLE hcp_graph_databases ENABLE ROW LEVEL SECURITY;
ALTER TABLE hcp_rdf_triples ENABLE ROW LEVEL SECURITY;
ALTER TABLE hcp_graph_query_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE hcp_blockchain_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hcp_smart_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hcp_blockchain_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE hcp_document_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE hcp_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE hcp_document_citations ENABLE ROW LEVEL SECURITY;

-- User Profile Policies
CREATE POLICY "Users can view own profile"
  ON hcp_user_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON hcp_user_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON hcp_user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Access Control Policies
CREATE POLICY "Users can view own access control"
  ON hcp_access_control FOR SELECT
  TO authenticated
  USING (profile_id IN (SELECT id FROM hcp_user_profiles WHERE user_id = auth.uid()));

-- Graph Database Policies
CREATE POLICY "Users can access own graph databases"
  ON hcp_graph_databases FOR ALL
  TO authenticated
  USING (profile_id IN (SELECT id FROM hcp_user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access own RDF triples"
  ON hcp_rdf_triples FOR ALL
  TO authenticated
  USING (profile_id IN (SELECT id FROM hcp_user_profiles WHERE user_id = auth.uid()));

-- Blockchain Policies
CREATE POLICY "Users can access own blockchain profile"
  ON hcp_blockchain_profiles FOR ALL
  TO authenticated
  USING (profile_id IN (SELECT id FROM hcp_user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own smart contracts"
  ON hcp_smart_contracts FOR SELECT
  TO authenticated
  USING (blockchain_profile_id IN (
    SELECT id FROM hcp_blockchain_profiles 
    WHERE profile_id IN (SELECT id FROM hcp_user_profiles WHERE user_id = auth.uid())
  ));

-- Document Store Policies
CREATE POLICY "Users can access own document stores"
  ON hcp_document_stores FOR ALL
  TO authenticated
  USING (profile_id IN (SELECT id FROM hcp_user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access own documents"
  ON hcp_documents FOR ALL
  TO authenticated
  USING (profile_id IN (SELECT id FROM hcp_user_profiles WHERE user_id = auth.uid()));

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to initialize all databases for a new user
CREATE OR REPLACE FUNCTION initialize_user_databases(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id uuid;
  v_result jsonb;
BEGIN
  -- Create user profile
  INSERT INTO hcp_user_profiles (user_id, given_name, family_name, email, date_of_birth)
  VALUES (p_user_id, 'User', 'Name', '', CURRENT_DATE)
  RETURNING id INTO v_profile_id;
  
  -- Initialize access control
  INSERT INTO hcp_access_control (profile_id)
  VALUES (v_profile_id);
  
  -- Initialize graph database
  INSERT INTO hcp_graph_databases (profile_id, graph_name, graph_uri)
  VALUES (v_profile_id, 'personal_medical_graph', 'urn:user:' || p_user_id::text || ':medical');
  
  -- Optional: Initialize document store
  INSERT INTO hcp_document_stores (profile_id, store_name)
  VALUES (v_profile_id, 'personal_archive');
  
  v_result := jsonb_build_object(
    'profile_id', v_profile_id,
    'databases_initialized', jsonb_build_object(
      'postgresql', true,
      'graph', true,
      'blockchain', false,
      'nosql', true
    )
  );
  
  RETURN v_result;
END;
$$;

-- Function to get user database status
CREATE OR REPLACE FUNCTION get_user_database_status(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id uuid;
  v_status jsonb;
BEGIN
  SELECT id INTO v_profile_id FROM hcp_user_profiles WHERE user_id = p_user_id;
  
  IF v_profile_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;
  
  SELECT jsonb_build_object(
    'profile_id', v_profile_id,
    'sql_database', jsonb_build_object(
      'active', true,
      'access_level', ac.sql_access_level,
      'storage_used_gb', ac.storage_used_gb
    ),
    'graph_database', jsonb_build_object(
      'active', EXISTS(SELECT 1 FROM hcp_graph_databases WHERE profile_id = v_profile_id),
      'triple_count', COALESCE((SELECT SUM(triple_count) FROM hcp_graph_databases WHERE profile_id = v_profile_id), 0),
      'access_level', ac.graph_access_level
    ),
    'blockchain', jsonb_build_object(
      'enabled', ac.blockchain_enabled,
      'active', EXISTS(SELECT 1 FROM hcp_blockchain_profiles WHERE profile_id = v_profile_id),
      'wallet_address', bp.wallet_address
    ),
    'document_store', jsonb_build_object(
      'enabled', ac.nosql_enabled,
      'active', EXISTS(SELECT 1 FROM hcp_document_stores WHERE profile_id = v_profile_id),
      'document_count', COALESCE((SELECT SUM(document_count) FROM hcp_document_stores WHERE profile_id = v_profile_id), 0)
    )
  ) INTO v_status
  FROM hcp_access_control ac
  LEFT JOIN hcp_blockchain_profiles bp ON bp.profile_id = v_profile_id
  WHERE ac.profile_id = v_profile_id;
  
  RETURN v_status;
END;
$$;