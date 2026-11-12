import fs from 'fs';
import path from 'path';

export interface DomainMetadata {
  id: string;
  name: string;
  path: string;
  status: string;
}

export interface DomainRegistryManifest {
  version: string;
  description: string;
  totalDomains: number;
  domains: DomainMetadata[];
}

export class DomainLoaderRegistry {
  private readonly manifestPath: string;
  private manifestCache: DomainRegistryManifest | null = null;

  constructor(manifestPath?: string) {
    this.manifestPath =
      manifestPath || path.resolve(process.cwd(), 'src/knowledge/metadata/domain-registry.manifest.json');
  }

  public getRegistryManifest(): DomainRegistryManifest {
    if (this.manifestCache) {
      return this.manifestCache;
    }

    if (!fs.existsSync(this.manifestPath)) {
      throw new Error(`[DomainLoaderRegistry] Master manifest not found at: "${this.manifestPath}".`);
    }

    try {
      const rawContent = fs.readFileSync(this.manifestPath, 'utf-8');
      this.manifestCache = JSON.parse(rawContent) as DomainRegistryManifest;
      return this.manifestCache;
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error(`[DomainLoaderRegistry] Failed to parse domain registry manifest: ${String(err)}`);
    }
  }

  public getDomainMetadata(domainId: string): DomainMetadata | null {
    const manifest = this.getRegistryManifest();
    return manifest.domains.find((d) => d.id.toLowerCase() === domainId.toLowerCase()) || null;
  }

  public getAllDomainIds(): string[] {
    return this.getRegistryManifest().domains.map((d) => d.id);
  }

  public hasDomain(domainId: string): boolean {
    return this.getDomainMetadata(domainId) !== null;
  }
}
