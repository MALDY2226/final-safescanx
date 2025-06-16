/*
  # Create behavioral analysis table

  1. New Tables
    - `behavioral_analysis`
      - `id` (uuid, primary key)
      - `file_hash` (text)
      - `is_malicious` (boolean)
      - `analysis_details` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policy for public inserts
*/

CREATE TABLE IF NOT EXISTS behavioral_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_hash text NOT NULL,
  is_malicious boolean NOT NULL,
  analysis_details jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE behavioral_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert behavioral analysis"
  ON behavioral_analysis FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read behavioral analysis"
  ON behavioral_analysis FOR SELECT
  TO public
  USING (true);