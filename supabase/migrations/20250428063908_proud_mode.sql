/*
  # Update malware hashes table

  1. Changes
    - Creates malware_hashes table if it doesn't exist
    - Adds necessary columns for hash tracking
    - No sample data included
  
  2. Security
    - Table has RLS enabled
    - No duplicate policies created
*/

-- Create malware_hashes table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'malware_hashes') THEN
    CREATE TABLE malware_hashes (
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
  END IF;
END $$;