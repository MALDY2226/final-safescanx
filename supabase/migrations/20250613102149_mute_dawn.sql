/*
  # Fix scan results visibility

  1. Changes
    - Update scan results policies to allow public read access
    - Remove IP-based restriction that may be preventing visibility
  
  2. Security
    - Maintain insert permissions for public users
    - Allow public read access to scan results
*/

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own results" ON scan_results;

-- Create new policy allowing public read access
CREATE POLICY "Public Read"
  ON scan_results FOR SELECT
  TO public
  USING (true);

-- Ensure insert policy exists
DROP POLICY IF EXISTS "Anyone can insert scan results" ON scan_results;
CREATE POLICY "Public Insert"
  ON scan_results FOR INSERT
  TO public
  WITH CHECK (true);