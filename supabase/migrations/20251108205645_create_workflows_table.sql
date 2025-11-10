/*
  # Create Workflows Table

  1. New Tables
    - `workflows`
      - `id` (uuid, primary key)
      - `name` (text) - User-defined workflow name
      - `description` (text) - Workflow description
      - `context_type` (text) - Associated context (HCP, BCP, MCP, DCP, GCP, etc.)
      - `workflow_data` (jsonb) - Contains nodes and connections
      - `created_by` (uuid) - User who created it
      - `workspace_id` (uuid) - Associated workspace
      - `is_template` (boolean) - Whether this is a reusable template
      - `status` (text) - active, archived, draft
      - `tags` (text[]) - Search tags
      - `execution_count` (integer) - How many times executed
      - `last_executed_at` (timestamptz) - Last execution time
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `workflows` table
    - Add policies for authenticated users to manage their own workflows
*/

CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  context_type text CHECK (context_type IN ('HCP', 'BCP', 'MCP', 'DCP', 'GCP', 'ACP', 'TCP', 'GeoCP', 'ECP', 'GENERAL')),
  workflow_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  workspace_id uuid,
  is_template boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  tags text[] DEFAULT ARRAY[]::text[],
  execution_count integer DEFAULT 0,
  last_executed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflows"
  ON workflows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create workflows"
  ON workflows FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own workflows"
  ON workflows FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR created_by IS NULL)
  WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

CREATE POLICY "Users can delete own workflows"
  ON workflows FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() OR created_by IS NULL);

CREATE INDEX IF NOT EXISTS idx_workflows_context_type ON workflows(context_type);
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_workflows_workspace_id ON workflows(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_tags ON workflows USING gin(tags);
