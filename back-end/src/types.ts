export interface ScanRequest {
  repositories: string[];
  scanType: 'full' | 'incremental';
}

export interface DependencyInfo {
  name: string;
  version: string;
  status: 'ok' | 'partial' | 'eol';
}

export interface RuntimeInfo {
  name: string;
  version: string;
  status: 'ok' | 'partial' | 'eol';
}

export interface DockerInfo {
  baseImage: string;
  version: string;
  status: 'ok' | 'partial' | 'eol';
}

export interface ScanResult {
  repository: string;
  runtimes: RuntimeInfo[];
  docker?: DockerInfo;
  dependencies: DependencyInfo[];
  error?: string;
}

export interface VersionStatus {
  name: string;
  versions: {
    version: string;
    status: 'ok' | 'partial' | 'eol';
    eolDate?: string;
  }[];
}
