import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import type { HashCheckResult } from '../lib/hashCheck';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ScanResultsProps {
  results: {
    hashResult: HashCheckResult;
    heuristicScore: number;
    staticAnalysis: boolean;
    behavioralAnalysis: boolean;
  };
}

export function ScanResults({ results }: ScanResultsProps) {
  const threats = [
    { name: 'Hash Check', detected: results.hashResult.isMatch },
    { name: 'Heuristic', detected: results.heuristicScore >= 2 },
    { name: 'Static Analysis', detected: results.staticAnalysis },
    { name: 'Behavioral', detected: results.behavioralAnalysis }
  ];
  
  const detectedCount = threats.filter(t => t.detected).length;
  const cleanCount = threats.length - detectedCount;
  
  const data = {
    labels: ['Threats Detected', 'Clean'],
    datasets: [
      {
        data: [detectedCount, cleanCount],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const isMalicious = detectedCount >= 2;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Scan Results</h2>
      <div className="w-64 h-64 mx-auto mb-6">
        <Pie data={data} />
      </div>
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${isMalicious ? 'bg-red-100' : 'bg-green-100'}`}>
          <h3 className="font-bold text-lg mb-2">
            {isMalicious ? 'Malicious File Detected' : 'File Appears Safe'}
          </h3>
          <p className="text-sm">
            {isMalicious 
              ? `${detectedCount} out of 4 security checks detected threats.`
              : 'No significant threats were detected in this file.'}
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm">
              <span className="font-semibold">Hash Analysis:</span>
              {results.hashResult.isMatch ? (
                <span className="text-red-600"> Match found in {results.hashResult.source} database</span>
              ) : ' No matches found'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Checks if the file matches known malware signatures in our database
            </p>
            {results.hashResult.isMatch && results.hashResult.threat && (
              <div className="ml-2 mt-1 text-sm text-red-600">
                <p>Name: {results.hashResult.threat.name}</p>
                {results.hashResult.threat.signature && (
                  <p>Signature: {results.hashResult.threat.signature}</p>
                )}
                {results.hashResult.threat.severity && (
                  <p>Severity: {results.hashResult.threat.severity}</p>
                )}
                {results.hashResult.threat.threatLevel && (
                  <p>Threat Level: {results.hashResult.threat.threatLevel}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm">
              <span className="font-semibold">Heuristic Score:</span>
              {` ${results.heuristicScore}/10`}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Analyzes file characteristics and patterns to identify suspicious features
            </p>
          </div>

          <div>
            <p className="text-sm">
              <span className="font-semibold">Static Analysis:</span>
              {results.staticAnalysis ? ' Suspicious patterns detected' : ' No suspicious patterns'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Examines file structure and content without execution to detect malicious code
            </p>
          </div>

          <div>
            <p className="text-sm">
              <span className="font-semibold">Behavioral Analysis:</span>
              {results.behavioralAnalysis ? ' Malicious behavior detected' : ' No malicious behavior'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Monitors file behavior in a secure sandbox environment to detect malicious activities
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}