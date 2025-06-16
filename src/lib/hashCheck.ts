import { checkMalwareBazaar } from './services/malwareBazaar';
import { supabase } from './supabase';

export interface HashCheckResult {
  isMatch: boolean;
  source?: 'supabase' | 'malwarebazaar';
  threat?: {
    name: string;
    signature?: string;
    threatLevel?: number;
    severity?: string;
  };
}

export async function checkFileHash(hash: string): Promise<HashCheckResult> {
  try {
    console.log('Checking hash in Supabase:', hash);
    
    // First check Supabase database using maybeSingle()
    const { data: supabaseMatch, error: supabaseError } = await supabase
      .from('malware_hashes')
      .select('*')
      .eq('hash', hash)
      .maybeSingle();

    if (supabaseError) {
      console.error('Supabase query failed:', supabaseError);
      return { isMatch: false };
    }

    // If found in Supabase, update last_seen and return result
    if (supabaseMatch) {
      console.log('Match found in Supabase:', supabaseMatch);
      
      await supabase
        .from('malware_hashes')
        .update({ last_seen: new Date().toISOString() })
        .eq('hash', hash);

      return {
        isMatch: true,
        source: 'supabase',
        threat: {
          name: supabaseMatch.name,
          signature: supabaseMatch.description,
          severity: supabaseMatch.severity,
        },
      };
    }

    // If not found in Supabase, check MalwareBazaar
    console.log('Hash not found in Supabase, checking MalwareBazaar...');
    const bazaarResult = await checkMalwareBazaar(hash);
    
    // If found in MalwareBazaar, store in Supabase and return result
    if (bazaarResult.isMatch && bazaarResult.threat) {
      console.log('Match found in MalwareBazaar:', bazaarResult);
      
      // Store the result in Supabase
      await supabase
        .from('malware_hashes')
        .insert({
          hash: hash,
          name: bazaarResult.threat.name,
          severity: bazaarResult.threat.threatLevel >= 15 ? 'critical' : 
                   bazaarResult.threat.threatLevel >= 10 ? 'high' : 
                   bazaarResult.threat.threatLevel >= 5 ? 'medium' : 'low',
          description: bazaarResult.threat.signature,
          last_seen: new Date().toISOString()
        })
        .select();

      return {
        isMatch: true,
        source: 'malwarebazaar',
        threat: bazaarResult.threat
      };
    }

    // If not found in either database, mark as clean
    console.log('No matches found in either database');
    return { isMatch: false };
  } catch (error) {
    console.error('Hash check failed:', error);
    return { isMatch: false };
  }
}