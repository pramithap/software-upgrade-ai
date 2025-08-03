import { Request, Response } from 'express';
import { RepositoryService } from '../services/RepositoryService';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';

export class ScanController {
  private repositoryService: RepositoryService;

  constructor() {
    this.repositoryService = new RepositoryService();
  }

  scan = async (req: Request, res: Response) => {
    try {
      const { repositories, scanType } = req.body;

      if (!Array.isArray(repositories) || repositories.length === 0) {
        return res.status(400).json({ error: 'repositories must be a non-empty array' });
      }

      const results = [];
      const tempDir = path.join(os.tmpdir(), 'repo-scan-' + Date.now());
      
      try {
        await fs.mkdir(tempDir);

        for (const repoUrl of repositories) {
          const repoName = path.basename(repoUrl, '.git');
          const repoPath = path.join(tempDir, repoName);
          
          await this.repositoryService.cloneRepository(repoUrl, repoPath);
          const scanResults = await this.repositoryService.scanConfigurationFiles(repoPath);
          
          results.push({
            repository: repoUrl,
            ...scanResults
          });
        }

        // Clean up
        await fs.rm(tempDir, { recursive: true, force: true });
        
        res.json({
          scanType,
          results
        });
      } catch (error) {
        // Clean up on error
        await fs.rm(tempDir, { recursive: true, force: true });
        throw error;
      }
    } catch (error) {
      console.error('Error during scan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
