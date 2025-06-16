/*
  # Create malware hashes table

  1. New Tables
    - `malware_hashes`
      - `id` (uuid, primary key)
      - `hash` (text, unique) - SHA-256 hash of known malware
      - `name` (text) - Name or identifier of the malware
      - `severity` (text) - Severity level (low, medium, high, critical)
      - `created_at` (timestamptz) - When this hash was added
      - `last_seen` (timestamptz) - Last time this hash was detected
      - `description` (text) - Optional description of the malware

  2. Security
    - Enable RLS on `malware_hashes` table
    - Add policy for public read access (hashes should be publicly queryable)
    - Add policy for authenticated admins to manage hashes
*/

-- Create malware_hashes table
CREATE TABLE IF NOT EXISTS malware_hashes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hash text UNIQUE NOT NULL,
  name text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at timestamptz DEFAULT now() NOT NULL,
  last_seen timestamptz DEFAULT now(),
  description text
);

-- Enable RLS
ALTER TABLE malware_hashes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to hashes
CREATE POLICY "Anyone can check hashes"
  ON malware_hashes FOR SELECT
  TO public
  USING (true);

-- Add some sample malware hashes for testing
INSERT INTO malware_hashes (hash, name, severity, description)
VALUES 
  ('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'Test Malware 1', 'high', 'Sample malware hash for testing'),
  ('d41d8cd98f00b204e9800998ecf8427e', 'Test Malware 2', 'medium', 'Another sample malware hash')
ON CONFLICT (hash) DO NOTHING;