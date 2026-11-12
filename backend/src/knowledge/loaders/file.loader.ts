import fs from 'fs';
import path from 'path';

export interface DiscoveredFile {
  domain: string;
  filePath: string;
  fileName: string;
}

export class FileLoader {
  private readonly baseDomainsDir: string;

  constructor(baseDomainsDir?: string) {
    this.baseDomainsDir = baseDomainsDir || path.resolve(process.cwd(), 'src/knowledge/domains');
  }

  public discoverDomains(): string[] {
    if (!fs.existsSync(this.baseDomainsDir)) {
      return [];
    }
    const entries = fs.readdirSync(this.baseDomainsDir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  }

  public discoverJsonFiles(domain?: string): DiscoveredFile[] {
    const discovered: DiscoveredFile[] = [];
    const domains = domain ? [domain] : this.discoverDomains();

    for (const dom of domains) {
      const domDir = path.join(this.baseDomainsDir, dom);
      if (!fs.existsSync(domDir)) continue;

      const files = fs.readdirSync(domDir);
      for (const file of files) {
        if (file.endsWith('.json') && file !== 'domain-manifest.json') {
          discovered.push({
            domain: dom,
            filePath: path.join(domDir, file),
            fileName: file,
          });
        }
      }
    }

    return discovered;
  }

  public parseJsonFile(filePath: string): any {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    try {
      return JSON.parse(content);
    } catch (err: any) {
      throw new Error(`JSON Syntax Error in "${filePath}": ${err.message}`);
    }
  }
}
