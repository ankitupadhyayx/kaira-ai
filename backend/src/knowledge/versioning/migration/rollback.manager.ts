import { VersionSnapshot } from '../types/versioning.types';

export class RollbackManager {
  private snapshotsMap = new Map<string, VersionSnapshot[]>();

  public saveSnapshot(domain: string, version: string, records: any[]): VersionSnapshot {
    const key = domain.toLowerCase();
    const snapshot: VersionSnapshot = {
      snapshotId: `SNAP_${domain}_${version}_${Date.now()}`,
      domain,
      version,
      timestamp: new Date().toISOString(),
      recordsCount: records.length,
      data: JSON.parse(JSON.stringify(records)),
    };

    const list = this.snapshotsMap.get(key) || [];
    list.push(snapshot);
    this.snapshotsMap.set(key, list);

    return snapshot;
  }

  public rollbackToSnapshot(domain: string, snapshotId: string): VersionSnapshot {
    const key = domain.toLowerCase();
    const list = this.snapshotsMap.get(key) || [];
    const found = list.find((s) => s.snapshotId === snapshotId);

    if (!found) {
      throw new Error(`[RollbackManager] Snapshot "${snapshotId}" not found for domain "${domain}".`);
    }

    return found;
  }

  public getSnapshotsForDomain(domain: string): VersionSnapshot[] {
    return this.snapshotsMap.get(domain.toLowerCase()) || [];
  }
}
