/*
  # Fix scan results policies

  1. Changes
    - Drop existing policies if they exist
    - Create new policies with different names to avoid conflicts
    - Allow public read and insert access to scan_results

  2. Security
    - Enable public read access to scan results
    - Enable public insert access for scan results
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own results" ON scan_results;
DROP POLICY IF EXISTS "Anyone can insert scan results" ON scan_results;
DROP POLICY IF EXISTS "Public Read" ON scan_results;
DROP POLICY IF EXISTS "Public Insert" ON scan_results;

-- Create new policies with unique names
CREATE POLICY "scan_results_public_select"
  ON scan_results FOR SELECT
  TO public
  USING (true);

CREATE POLICY "scan_results_public_insert"
  ON scan_results FOR INSERT
  TO public
  WITH CHECK (true);