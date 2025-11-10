/*
  # Allow GICS Hierarchy Data Loading

  1. Security Changes
    - Add INSERT policy to allow loading GICS reference data
    - GICS data is public reference data, safe to allow inserts
    - Frontend needs to load CSV data on first use

  2. Policy
    - Allow anyone to insert GICS hierarchy data
    - This is reference data, not user-specific
*/

-- Allow anyone to insert GICS hierarchy data (reference data)
CREATE POLICY "Anyone can insert GICS hierarchy"
  ON gics_hierarchy
  FOR INSERT
  TO public
  WITH CHECK (true);