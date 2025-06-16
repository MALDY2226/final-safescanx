import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ScanResults } from './components/ScanResults';
import { supabase } from './lib/supabase';
import { uploadFile } from './lib/storage';
import { checkFileHash } from './lib/hashCheck';
import {
  generateFileHash,
  performHeuristicAnalysis,
  performStaticAnalysis,
  performBehavioralAnalysis,
  addMaliciousHash
} from './lib/scanners';

export default function App() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileSelect = async (file: File) => {
    setScanning(true);
    try {
      const fileHash = await generateFileHash(file);
      
      const [
        hashResult,
        heuristicScore,
        staticResult,
        behavioralResult
      ] = await Promise.all([
        checkFileHash(fileHash),
        performHeuristicAnalysis(file),
        performStaticAnalysis(file),
        performBehavioralAnalysis(file)
      ]);

      const uploadData = await uploadFile(file, fileHash);

      // Determine if the file is malicious based on multiple factors
      const isMalicious = 
        hashResult.isMatch || 
        heuristicScore >= 7 || 
        (staticResult && behavioralResult) ||
        (heuristicScore >= 5 && (staticResult || behavioralResult));

      // If malicious, add to malware_hashes
      if (isMalicious) {
        await addMaliciousHash(fileHash, file.name, {
          heuristicScore,
          staticAnalysis: staticResult,
          behavioralAnalysis: behavioralResult
        });
      }

      const { error: dbError } = await supabase
        .from('scan_results')
        .insert({
          file_hash: fileHash,
          file_name: file.name,
          file_size: file.size,
          file_path: uploadData?.path,
          heuristic_score: heuristicScore,
          static_analysis: staticResult,
          behavioral_analysis: behavioralResult,
          ip_address: await fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => data.ip)
            .catch(() => 'unknown')
        });

      if (dbError) throw dbError;

      setResults({
        hashResult,
        heuristicScore,
        staticAnalysis: staticResult,
        behavioralAnalysis: behavioralResult
      });
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow max-w-4xl mx-auto py-12 px-4 w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SafeScanX
          </h1>
          <p className="text-lg text-gray-600">
            Advanced Malware Detection System
          </p>
        </div>

        {!results && !scanning && (
          <FileUpload onFileSelect={handleFileSelect} />
        )}

        {scanning && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Scanning file...</p>
          </div>
        )}

        {results && !scanning && (
          <ScanResults results={results} />
        )}
      </div>
      
      <footer className="bg-gray-800 text-white py-4 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} SafeScanX. All rights reserved. Advanced Malware Detection System.
        </p>
      </footer>
    </div>
  );
}