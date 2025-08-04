'use client';

import { FormEvent, useState, useCallback, useEffect } from 'react';

// Type definitions
interface Dependency {
  name: string;
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
}

interface ScanResult {
  repository: string;
  data: {
    dependencies: Dependency[];
    status: 'pending' | 'scanning' | 'completed' | 'error';
    error?: string;
  };
}

// No longer needed since we're not using SSE

type ScanType = 'full' | 'incremental';

interface FormState {
  repositories: string[];
  scanType: ScanType;
  scanning: boolean;
  error: string;
  progress: number;
  results: ScanResult[];
}

const initialState: FormState = {
  repositories: [''],
  scanType: 'full',
  scanning: false,
  error: '',
  progress: 0,
  results: []
};

export default function ScanPage() {
  const [state, setState] = useState<FormState>(initialState);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  const clearPollInterval = useCallback(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
  }, [pollInterval]);

  useEffect(() => {
    return () => clearPollInterval();
  }, [clearPollInterval]);

  const handleRepositoryChange = useCallback((index: number, value: string) => {
    setState(prev => ({
      ...prev,
      repositories: prev.repositories.map((repo, i) =>
        i === index ? value : repo
      )
    }));
  }, []);

  const handleAddRepository = useCallback(() => {
    setState(prev => {
      // Get the last non-empty repository URL
      const lastRepo = [...prev.repositories].reverse().find(repo => repo.trim() !== '') || '';
      return {
        ...prev,
        repositories: [...prev.repositories, lastRepo]
      };
    });
  }, []);

  const handleRemoveRepository = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      repositories: prev.repositories.filter((_, i) => i !== index)
    }));
  }, []);

  const handleScanTypeChange = useCallback((type: ScanType) => {
    setState(prev => ({
      ...prev,
      scanType: type
    }));
  }, []);

  const getApiUrl = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';  // Use empty string to default to same origin
    return `${baseUrl}/api/${state.scanType === 'full' ? 'scan' : 'scan/incremental'}`;
  }, [state.scanType]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();

    if (state.repositories.some(repo => !repo.trim())) {
      setState(prev => ({
        ...prev,
        error: 'Please fill in all repository fields'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      error: '',
      scanning: true,
      progress: 0,
      results: []
    }));

    try {
      clearPollInterval();
      
      const repositories = state.repositories.filter(repo => repo.trim());
      const apiUrl = getApiUrl();
      
      // First, make the POST request to initiate the scan
      console.log('Initiating scan with:', { apiUrl, repositories, scanType: state.scanType });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repositories, scanType: state.scanType })
      });

      if (!response.ok) {
        throw new Error('Failed to initiate scan');
      }

      const { scanId } = await response.json();
      
      // Start polling for progress
      const interval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`${apiUrl}?scanId=${scanId}`);
          if (statusResponse.ok) {
            const status = await statusResponse.json();
            
            setState(prev => ({
              ...prev,
              progress: status.progress || 0,
              results: status.results || []
            }));

            // If scan is complete or there's an error, stop polling
            if (status.progress === 100 || status.error) {
              clearInterval(interval);
              setPollInterval(null);
              setState(prev => ({ 
                ...prev, 
                scanning: false,
                error: status.error || ''
              }));
            }
          } else {
            throw new Error('Failed to fetch scan status');
          }
        } catch (error) {
          clearInterval(interval);
          setPollInterval(null);
          setState(prev => ({
            ...prev,
            error: error instanceof Error ? error.message : 'Failed to fetch scan status',
            scanning: false
          }));
        }
      }, 1000);

      setPollInterval(interval);
    } catch (err) {
      console.error('Error starting scan:', err);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to start scan',
        scanning: false
      }));
      clearPollInterval();
    }
  }, [state.repositories, state.scanType, getApiUrl, clearPollInterval]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Repository Scanner</h1>
      
      {state.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8">
          <div className="whitespace-pre-line text-center">
            {state.error}
          </div>
          {state.error.includes('Could not connect to the backend server') && (
            <div className="mt-4 text-sm bg-red-50 p-4 rounded">
              <strong>Troubleshooting Steps:</strong>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>Make sure you've started the backend server</li>
                <li>Check if port 3001 is available and not in use</li>
                <li>Verify your network connection</li>
                <li>Check if any security software is blocking the connection</li>
              </ol>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="block text-lg font-medium text-center mb-4">Repository URLs</label>
          {state.repositories.map((repo, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={repo}
                onChange={(e) => handleRepositoryChange(index, e.target.value)}
                placeholder="Enter repository URL (e.g., owner/repo or full URL)"
                className="flex-1 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={state.scanning}
              />
              {state.repositories.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveRepository(index)}
                  className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={state.scanning}
                  title="Remove repository"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddRepository}
            className="w-full mt-4 p-3 border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
            disabled={state.scanning}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Add Repository
          </button>
        </div>

        <div className="space-y-4">
          <label className="block text-lg font-medium text-center mb-2">Scan Type</label>
          <div className="flex justify-center gap-8">
            <label className="inline-flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                value="full"
                checked={state.scanType === 'full'}
                onChange={() => handleScanTypeChange('full')}
                disabled={state.scanning}
                className="w-5 h-5 text-blue-600 mr-3"
              />
              <div className="flex flex-col">
                <span className="text-lg">Full Scan</span>
                <span className="text-sm text-gray-500">Scan all dependencies</span>
              </div>
            </label>
            <label className="inline-flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                value="incremental"
                checked={state.scanType === 'incremental'}
                onChange={() => handleScanTypeChange('incremental')}
                disabled={state.scanning}
                className="w-5 h-5 text-blue-600 mr-3"
              />
              <div className="flex flex-col">
                <span className="text-lg">Incremental Scan</span>
                <span className="text-sm text-gray-500">Only scan changed dependencies</span>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={state.scanning || state.repositories.length === 0}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg text-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors mt-8 flex items-center justify-center gap-2"
        >
          {state.scanning ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Scanning...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Start Scan
            </>
          )}
        </button>
      </form>

      {state.scanning && (
        <div className="mt-8">
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${state.progress}%` }}
            >
              <div className="text-xs text-white text-center leading-4">
                {state.progress}%
              </div>
            </div>
          </div>
        </div>
      )}

      {state.results.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Scan Results</h2>
          <div className="space-y-8">
            {state.results.map((result, index) => (
              <div key={index} className="overflow-hidden border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-blue-50 p-4 border-b">
                  <h3 className="text-xl font-bold text-blue-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                    </svg>
                    {result.repository}
                  </h3>
                  <div className="mt-2 text-sm text-blue-600">
                    Status: <span className={`font-semibold ${result.data.status === 'completed' ? 'text-green-600' : result.data.status === 'error' ? 'text-red-600' : 'text-blue-600'}`}>
                      {result.data.status}
                    </span>
                  </div>
                  {result.data.error && (
                    <div className="mt-2 text-sm text-red-600">
                      Error: {result.data.error}
                    </div>
                  )}
                </div>
                {result.data.dependencies.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b">Package Name</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b">Current Version</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b">Latest Version</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y">
                        {result.data.dependencies.map((dep, depIndex) => (
                          <tr key={depIndex} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{dep.name}</td>
                            <td className="px-4 py-3 font-mono text-gray-600">{dep.currentVersion}</td>
                            <td className="px-4 py-3 font-mono text-gray-600">{dep.latestVersion || 'N/A'}</td>
                            <td className="px-4 py-3">
                              {dep.updateAvailable ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Update Available
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Up to Date
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : result.data.status === 'completed' ? (
                  <div className="p-6 text-center text-gray-500">
                    No dependencies found in this repository
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
