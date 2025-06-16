import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
  },
  db: {
    schema: 'public'
  }
});

// Verify connection and initialize tables
async function initializeDatabase() {
  try {
    // Test connection
    const { data, error } = await supabase
      .from('scan_results')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Database initialization error:', error);
      return;
    }
    
    console.log('Supabase connection established successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

initializeDatabase();