export interface VersionMetrics {
  totalDomainsRegistered: number;
  totalSnapshotsSaved: number;
  totalAuditLogsRecorded: number;
  activeVersionsCount: number;
}

export class VersionReport {
  public static generateReport(metrics: VersionMetrics): string {
    return `=== KNOWLEDGE VERSIONING REPORT ===
Registered Domains: ${metrics.totalDomainsRegistered}
Snapshots Saved: ${metrics.totalSnapshotsSaved}
Audit Logs Recorded: ${metrics.totalAuditLogsRecorded}
Active Versions Count: ${metrics.activeVersionsCount}
===================================`;
  }
}
