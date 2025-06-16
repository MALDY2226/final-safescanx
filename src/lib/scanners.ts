import CryptoJS from 'crypto-js';
import { supabase } from './supabase';
import { submitToHybridAnalysis } from './services/hybridAnalysis';

export async function generateFileHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const wordArray = CryptoJS.lib.WordArray.create(e.target.result as ArrayBuffer);
        const hash = CryptoJS.SHA256(wordArray).toString();
        resolve(hash);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

export async function performHeuristicAnalysis(file: File): Promise<number> {
  let score = 0;
  
  // Check file extension vs actual content type
  const expectedType = file.type;
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  // Specific checks for batch files
  if (extension === 'bat' || extension === 'cmd') {
    score += 3; // Higher base score for script files
    
    // Read file content to check for suspicious patterns
    const text = await file.text();
    if (text.includes('while') || text.includes(':loop') || text.includes('goto')) {
      score += 2; // Additional score for potential infinite loops
    }
  }

  if (!expectedType.includes(extension || '')) {
    score += 2;
  }

  // Check file size anomalies
  if (file.size < 100) score += 1;
  if (file.size > 50 * 1024 * 1024) score += 2;
  
  return score;
}

export async function performStaticAnalysis(file: File): Promise<boolean> {
  const suspiciousExtensions = ['exe', 'dll', 'bat', 'cmd', 'vbs', 'js'];
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (suspiciousExtensions.includes(extension || '')) {
    // For batch files, perform additional content analysis
    if (extension === 'bat' || extension === 'cmd') {
      const content = await file.text();
      const suspiciousPatterns = [
        'while true',
        ':loop',
        'goto',
        'start /b',
        'shutdown',
        'taskkill',
        'del',
        'rd /s',
        'format'
      ];
      
      return suspiciousPatterns.some(pattern => content.toLowerCase().includes(pattern));
    }
    return true;
  }
  
  return false;
}

export async function performBehavioralAnalysis(file: File): Promise<boolean> {
  try {
    const fileHash = await generateFileHash(file);
    
    // Check if we have any previous behavioral analysis results
    const { data: existingAnalysis, error } = await supabase
      .from('behavioral_analysis')
      .select('is_malicious')
      .eq('file_hash', fileHash)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Behavioral analysis query error:', error);
      return false;
    }

    if (existingAnalysis) {
      return existingAnalysis.is_malicious;
    }

    // Submit to Hybrid Analysis
    const sandboxResult = await submitToHybridAnalysis(file);
    
    // Store the analysis results
    const { error: insertError } = await supabase
      .from('behavioral_analysis')
      .insert({
        file_hash: fileHash,
        is_malicious: sandboxResult.malicious,
        analysis_details: sandboxResult.details || {
          error: 'Analysis failed or timed out'
        }
      });

    if (insertError) {
      console.error('Failed to store behavioral analysis:', insertError);
    }

    return sandboxResult.malicious;
  } catch (error) {
    console.error('Behavioral analysis error:', error);
    return false;
  }
}

interface MaliciousHashDetails {
  heuristicScore: number;
  staticAnalysis: boolean;
  behavioralAnalysis: boolean;
}

export async function addMaliciousHash(
  hash: string,
  fileName: string,
  details: MaliciousHashDetails
): Promise<void> {
  try {
    // Determine severity based on detection methods
    let severity: 'low' | 'medium' | 'high' | 'critical';
    
    if (details.heuristicScore >= 8 || (details.staticAnalysis && details.behavioralAnalysis)) {
      severity = 'critical';
    } else if (details.heuristicScore >= 6 || (details.staticAnalysis || details.behavioralAnalysis)) {
      severity = 'high';
    } else if (details.heuristicScore >= 4) {
      severity = 'medium';
    } else {
      severity = 'low';
    }

    // Create description from analysis details
    const description = [
      `Detected as malicious through multiple analysis methods:`,
      `- Heuristic Score: ${details.heuristicScore}/10`,
      details.staticAnalysis ? '- Static Analysis: Suspicious patterns detected' : '',
      details.behavioralAnalysis ? '- Behavioral Analysis: Malicious behavior detected' : ''
    ].filter(Boolean).join('\n');

    // Add to malware_hashes table
    const { error } = await supabase
      .from('malware_hashes')
      .insert({
        hash,
        name: fileName,
        severity,
        description,
        last_seen: new Date().toISOString()
      })
      .select()
      .maybeSingle();

    if (error) {
      // If hash already exists, update last_seen
      if (error.code === '23505') { // Unique violation
        await supabase
          .from('malware_hashes')
          .update({ last_seen: new Date().toISOString() })
          .eq('hash', hash);
      } else {
        console.error('Failed to add malicious hash:', error);
      }
    }
  } catch (error) {
    console.error('Error adding malicious hash:', error);
  }
}