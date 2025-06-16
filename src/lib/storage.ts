import { supabase } from './supabase';

export async function uploadFile(file: File, hash: string) {
  try {
    const filePath = `${hash}/${file.name}`;
    
    // Check if file already exists
    const { data: existingFile, error: listError } = await supabase.storage
      .from('scanned-files')
      .list(hash);

    if (listError) {
      console.error('Storage list error:', listError);
      return { path: filePath };
    }

    // If file exists, return existing path
    if (existingFile && existingFile.length > 0) {
      return { path: filePath };
    }

    // Upload new file with retries
    let retries = 3;
    let uploadError = null;

    while (retries > 0) {
      const { data, error } = await supabase.storage
        .from('scanned-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'application/octet-stream'
        });

      if (!error) {
        return data;
      }

      uploadError = error;
      retries--;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
    }

    console.error('Storage upload failed after retries:', uploadError);
    return { path: filePath };
  } catch (error) {
    console.error('Storage upload failed:', error);
    return { path: `${hash}/${file.name}` };
  }
}