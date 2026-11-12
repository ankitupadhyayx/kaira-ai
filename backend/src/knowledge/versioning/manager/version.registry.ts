import { VersionMetadata } from '../types/versioning.types';

export class VersionRegistry {
  private registry = new Map<string, VersionMetadata>();

  public registerDomainVersion(metadata: VersionMetadata): void {
    this.registry.set(metadata.domain.toLowerCase(), metadata);
  }

  public getDomainVersion(domain: string): VersionMetadata | null {
    return this.registry.get(domain.toLowerCase()) || null;
  }

  public getAllRegisteredVersions(): Map<string, VersionMetadata> {
    return new Map(this.registry);
  }
}
