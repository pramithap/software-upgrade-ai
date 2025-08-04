export interface ScanResult {
  repoUrl: string;
  scanType: 'full' | 'incremental';
  timestamp: string;
  dependencies: any[];
  success: boolean;
  error?: string;
}