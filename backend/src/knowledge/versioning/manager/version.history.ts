import { VersionMetadata } from '../types/versioning.types';

export class VersionHistory {
  private historyMap = new Map<string, VersionMetadata[]>();

  public appendHistory(metadata: VersionMetadata): void {
    const key = metadata.domain.toLowerCase();
    const list = this.historyMap.get(key) || [];
    list.push({ ...metadata });
    this.historyMap.set(key, list);
  }

  public getHistory(domain: string): VersionMetadata[] {
    return this.historyMap.get(domain.toLowerCase()) || [];
  }
}
