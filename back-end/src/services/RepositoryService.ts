import simpleGit, { SimpleGit } from 'simple-git';
import * as fs from 'fs/promises';
import * as path from 'path';
import { DependencyParserService } from './DependencyParserService';

export class RepositoryService {
  private git: SimpleGit;
  private dependencyParser: DependencyParserService;

  constructor() {
    this.git = simpleGit();
    this.dependencyParser = new DependencyParserService();
  }

  async cloneRepository(url: string, targetDir: string): Promise<void> {
    try {
      await this.git.clone(url, targetDir);
    } catch (error) {
      console.error(`Error cloning repository: ${error}`);
      throw error;
    }
  }

  async scanConfigurationFiles(repoPath: string) {
    const results: any = {
      packageJson: null,
      pomXml: null,
      dockerfile: null,
    };

    try {
      // Check for package.json
      const packageJsonPath = path.join(repoPath, 'package.json');
      if (await this.fileExists(packageJsonPath)) {
        results.packageJson = await this.dependencyParser.parsePackageJson(packageJsonPath);
      }

      // Check for pom.xml
      const pomXmlPath = path.join(repoPath, 'pom.xml');
      if (await this.fileExists(pomXmlPath)) {
        results.pomXml = await this.dependencyParser.parsePomXml(pomXmlPath);
      }

      // Check for Dockerfile
      const dockerfilePath = path.join(repoPath, 'Dockerfile');
      if (await this.fileExists(dockerfilePath)) {
        results.dockerfile = await this.dependencyParser.parseDockerfile(dockerfilePath);
      }

      return results;
    } catch (error) {
      console.error(`Error scanning configuration files: ${error}`);
      throw error;
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
