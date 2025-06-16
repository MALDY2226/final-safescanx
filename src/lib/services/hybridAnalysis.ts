interface HybridAnalysisResult {
  success: boolean;
  malicious: boolean;
  details?: {
    verdict: string;
    threatScore: number;
    suspiciousProcesses: string[];
    networkConnections: string[];
    fileOperations: string[];
    registryOperations: string[];
  };
}

export async function submitToHybridAnalysis(file: File): Promise<HybridAnalysisResult> {
  try {
    console.log('Submitting to Hybrid Analysis:', file.name);

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/malware-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ hash: await generateFileHash(file) })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const { hybridAnalysis: result } = await response.json();

    if (result.state === 'SUCCESS') {
      console.log('Analysis completed successfully');
      
      const details = {
        verdict: result.verdict || 'unknown',
        threatScore: result.threat_score || 0,
        suspiciousProcesses: (result.processes || [])
          .filter(p => p.suspicious)
          .map(p => `${p.name} (${p.cmd_line})`),
        networkConnections: (result.network_connections || [])
          .map(c => `${c.protocol}://${c.destination}:${c.port}`),
        fileOperations: (result.file_operations || [])
          .map(f => `${f.operation}: ${f.path}`),
        registryOperations: (result.registry_operations || [])
          .map(r => `${r.operation}: ${r.key}`)
      };

      const isMalicious = 
        (result.threat_score && result.threat_score >= 75) || 
        details.suspiciousProcesses.length > 0 ||
        result.verdict === 'malicious';

      return {
        success: true,
        malicious: isMalicious,
        details
      };
    }

    return {
      success: false,
      malicious: false,
      details: {
        verdict: 'error',
        threatScore: 0,
        suspiciousProcesses: [],
        networkConnections: [],
        fileOperations: [],
        registryOperations: []
      }
    };
  } catch (error) {
    console.error('Hybrid Analysis error:', error);
    return {
      success: false,
      malicious: false,
      details: {
        verdict: 'error',
        threatScore: 0,
        suspiciousProcesses: [],
        networkConnections: [],
        fileOperations: [],
        registryOperations: []
      }
    };
  }
}

async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}