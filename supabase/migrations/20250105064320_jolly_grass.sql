/*
  # Storage Configuration for Scanned Files

  1. Storage Setup
    - Creates public storage bucket for scanned files
    - Sets up secure access policies
  
  2. Security
    - Enables public read access
    - Allows authenticated and anonymous uploads
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('scanned-files', 'scanned-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Anyone can upload files"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'scanned-files');

CREATE POLICY "Anyone can read files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'scanned-files');