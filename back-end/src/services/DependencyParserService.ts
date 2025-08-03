import * as fs from 'fs/promises';
import { parseString } from 'xml2js';
import { DependencyInfo, RuntimeInfo } from '../types';

interface PomXmlDependency {
  groupId: string[];
  artifactId: string[];
  version: string[];
}

interface PomXml {
  project?: {
    properties?: [{
      'java.version'?: string[];
    }];
    dependencies?: [{
      dependency?: PomXmlDependency[];
    }];
  };
}

const parseXmlString = (xml: string): Promise<PomXml> => {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err) reject(err);
      else resolve(result as PomXml);
    });
  });
};

export class DependencyParserService {
  async parsePackageJson(filePath: string): Promise<{ runtime?: RuntimeInfo; dependencies: DependencyInfo[] }> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const packageJson = JSON.parse(content);
      const dependencies: DependencyInfo[] = [];
      let runtime: RuntimeInfo | undefined;

      if (packageJson.engines?.node) {
        runtime = {
          name: 'Node.js',
          version: packageJson.engines.node.replace(/[^\d.]/g, ''),
          status: 'ok'
        };
      }

      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      for (const [name, version] of Object.entries(allDeps)) {
        dependencies.push({
          name,
          version: (version as string).replace(/[^\d.]/g, ''),
          status: 'ok'
        });
      }

      return { runtime, dependencies };
    } catch (error) {
      console.error(`Error parsing package.json: ${error}`);
      return { dependencies: [] };
    }
  }

  async parsePomXml(filePath: string): Promise<{ runtime?: RuntimeInfo; dependencies: DependencyInfo[] }> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const result = await parseXmlString(content);
      const dependencies: DependencyInfo[] = [];
      let runtime: RuntimeInfo | undefined;

      if (result.project?.properties?.[0]?.['java.version']?.[0]) {
        runtime = {
          name: 'Java',
          version: result.project.properties[0]['java.version'][0],
          status: 'ok'
        };
      }

      if (result.project?.dependencies?.[0]?.dependency) {
        for (const dep of result.project.dependencies[0].dependency) {
          dependencies.push({
            name: `${dep.groupId[0]}:${dep.artifactId[0]}`,
            version: dep.version[0],
            status: 'ok'
          });
        }
      }

      return { runtime, dependencies };
    } catch (error) {
      console.error(`Error parsing pom.xml: ${error}`);
      return { dependencies: [] };
    }
  }

  async parseDockerfile(filePath: string): Promise<{ baseImage: string; version: string }> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const fromLine = content.split('\n').find(line => line.trim().startsWith('FROM'));
      
      if (!fromLine) {
        throw new Error('No FROM instruction found in Dockerfile');
      }

      const [_, baseImage] = fromLine.trim().split(/\s+/);
      const [image, version] = baseImage.split(':');

      return {
        baseImage: image,
        version: version || 'latest'
      };
    } catch (error) {
      console.error(`Error parsing Dockerfile: ${error}`);
      throw error;
    }
  }
}
