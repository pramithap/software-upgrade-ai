import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export class TempDirectory {
  private tempDir: string;

  constructor() {
    this.tempDir = '';
  }

  async create(): Promise<string> {
    const prefix = 'repo-scan-';
    const uniqueSuffix = crypto.randomBytes(6).toString('hex');
    this.tempDir = path.join(os.tmpdir(), `${prefix}${uniqueSuffix}`);
    
    await fs.mkdir(this.tempDir, { recursive: true });
    return this.tempDir;
  }

  async cleanup(): Promise<void> {
    if (this.tempDir) {
      try {
        await this.removeDirectory(this.tempDir);
      } catch (error) {
        console.error('Error cleaning up temp directory:', error);
        throw error;
      }
    }
  }

  private async removeDirectory(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    await Promise.all(entries.map(async entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await this.removeDirectory(fullPath);
      } else {
        await fs.unlink(fullPath);
      }
    }));

    await fs.rmdir(dir);
  }

  getPath(): string {
    return this.tempDir;
  }
}
