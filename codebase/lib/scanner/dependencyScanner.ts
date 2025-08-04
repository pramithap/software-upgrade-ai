import * as fs from 'fs/promises';
import * as path from 'path';

export interface Dependency {
  name: string;
  currentVersion: string;
  type: 'npm' | 'pip' | 'maven' | 'system' | 'other';
  path?: string;
}

export class DependencyScanner {
  async scanRepository(repoPath: string, scanType: 'full' | 'incremental'): Promise<Dependency[]> {
    const dependencies: Dependency[] = [];
    
    // Scan for package.json files
    const packageJsonFiles = await this.findFiles(repoPath, 'package.json');
    for (const file of packageJsonFiles) {
      const npmDeps = await this.parsePackageJson(file);
      dependencies.push(...npmDeps);
    }

    // Scan for requirements.txt files (Python)
    const requirementsFiles = await this.findFiles(repoPath, 'requirements.txt');
    for (const file of requirementsFiles) {
      const pipDeps = await this.parseRequirementsTxt(file);
      dependencies.push(...pipDeps);
    }

    // Scan for pom.xml files (Maven)
    const pomFiles = await this.findFiles(repoPath, 'pom.xml');
    for (const file of pomFiles) {
      const mavenDeps = await this.parsePomXml(file);
      dependencies.push(...mavenDeps);
    }

    // Remove duplicates
    const uniqueDeps = this.deduplicateDependencies(dependencies);
    
    return uniqueDeps;
  }

  private async findFiles(dir: string, filename: string): Promise<string[]> {
    const files: string[] = [];
    
    async function scan(directory: string) {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await scan(fullPath);
        } else if (entry.isFile() && entry.name === filename) {
          files.push(fullPath);
        }
      }
    }

    await scan(dir);
    return files;
  }

  private async parsePackageJson(filePath: string): Promise<Dependency[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const pkg = JSON.parse(content);
      const dependencies: Dependency[] = [];

      // Parse dependencies and devDependencies
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      for (const [name, version] of Object.entries(allDeps)) {
        dependencies.push({
          name,
          currentVersion: (version as string).replace(/[^\d.]/g, ''),
          type: 'npm',
          path: filePath
        });
      }

      return dependencies;
    } catch (error) {
      console.error(`Error parsing package.json at ${filePath}:`, error);
      return [];
    }
  }

  private async parseRequirementsTxt(filePath: string): Promise<Dependency[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const dependencies: Dependency[] = [];

      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          // Handle different requirement formats
          const match = trimmed.match(/^([^=<>~!]+)([=<>~!]=?)?(.+)?$/);
          if (match) {
            const [_, name, operator, version] = match;
            dependencies.push({
              name: name.trim(),
              currentVersion: version ? version.trim() : 'latest',
              type: 'pip',
              path: filePath
            });
          }
        }
      }

      return dependencies;
    } catch (error) {
      console.error(`Error parsing requirements.txt at ${filePath}:`, error);
      return [];
    }
  }

  private async parsePomXml(filePath: string): Promise<Dependency[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const dependencies: Dependency[] = [];

      // Basic XML parsing using regex (for demo - in production use a proper XML parser)
      const depMatches = content.match(/<dependency>[\s\S]*?<\/dependency>/g);
      
      if (depMatches) {
        for (const dep of depMatches) {
          const groupId = dep.match(/<groupId>(.*?)<\/groupId>/)?.[1];
          const artifactId = dep.match(/<artifactId>(.*?)<\/artifactId>/)?.[1];
          const version = dep.match(/<version>(.*?)<\/version>/)?.[1];

          if (groupId && artifactId) {
            dependencies.push({
              name: `${groupId}:${artifactId}`,
              currentVersion: version || 'latest',
              type: 'maven',
              path: filePath
            });
          }
        }
      }

      return dependencies;
    } catch (error) {
      console.error(`Error parsing pom.xml at ${filePath}:`, error);
      return [];
    }
  }

  private deduplicateDependencies(dependencies: Dependency[]): Dependency[] {
    const dedupMap = new Map<string, Dependency>();
    
    for (const dep of dependencies) {
      const key = `${dep.type}:${dep.name}`;
      if (!dedupMap.has(key)) {
        dedupMap.set(key, dep);
      }
    }
    
    return Array.from(dedupMap.values());
  }
}
