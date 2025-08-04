const git = require('simple-git');
import { TempDirectory } from './tempDirectory';
import { DependencyScanner } from './dependencyScanner';
import { ScanResult } from '../types';

export class RepositoryScanner {
  private git: any;
  private tempDir: TempDirectory;
  private depScanner: DependencyScanner;

  constructor() {
    this.git = git();
    this.tempDir = new TempDirectory();
    this.depScanner = new DependencyScanner();
  }

  async scanRepository(repoUrl: string, scanType: 'full' | 'incremental'): Promise<ScanResult> {
    const tempPath = await this.tempDir.create();
    
    try {
      // Clone the repository
      await this.git.clone(repoUrl, tempPath);
      
      // Perform dependency scan
      const dependencies = await this.depScanner.scanRepository(tempPath, scanType);

      const result: ScanResult = {
        repoUrl,
        scanType,
        timestamp: new Date().toISOString(),
        dependencies,
        success: true
      };

      return result;
    } catch (error) {
      console.error('Error scanning repository:', error);
      return {
        repoUrl,
        scanType,
        timestamp: new Date().toISOString(),
        dependencies: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      // Clean up temporary directory
      await this.tempDir.cleanup();
    }
  }
}
