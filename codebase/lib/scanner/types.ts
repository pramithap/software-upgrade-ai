export interface Dependency {
  name: string;
  currentVersion: string;
  type: 'npm' | 'pip' | 'maven' | 'system' | 'other';
  path?: string;
}

export interface ScanResult {
  repoUrl: string;
  scanType: 'full' | 'incremental';
  timestamp: string;
  dependencies: Dependency[];
  success: boolean;
  error?: string;
}

export interface ScanRequest {
  repoUrl: string;
  scanType: 'full' | 'incremental';
}
