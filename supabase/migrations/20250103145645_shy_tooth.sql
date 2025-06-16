/*
  # Create scan results table
  
  1. New Tables
    - `scan_results`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `file_hash` (text)
      - `file_name` (text)
      - `file_size` (bigint)
      - `file_path` (text)
      - `heuristic_score` (integer)
      - `static_analysis` (boolean)
      - `behavioral_analysis` (boolean)
      - `ip_address` (text)
  
  2. Security
    - Enable RLS on `scan_results` table
    - Add policies for:
      - Inserting results (anonymous and authenticated users)
      - Viewing results (authenticated users only)
*/

CREATE TABLE IF NOT EXISTS scan_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  file_hash text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_path text,
  heuristic_score integer NOT NULL,
  static_analysis boolean NOT NULL,
  behavioral_analysis boolean NOT NULL,
  ip_address text NOT NULL
);

-- Enable RLS
ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated and anonymous users
CREATE POLICY "Anyone can insert scan results"
  ON scan_results FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow users to view their own scan results
CREATE POLICY "Users can view their own results"
  ON scan_results FOR SELECT
  TO authenticated
  USING (
    ip_address = current_setting('request.headers')::json->>'x-forwarded-for'
  );