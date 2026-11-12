export interface LoaderMetrics {
  totalDomainsDiscovered: number;
  totalFilesDiscovered: number;
  totalRecordsLoaded: number;
  totalRecordsSkipped: number;
  totalIndexesBuilt: number;
  totalDuplicatesDetected: number;
  loadDurationMs: number;
  isEngineReady: boolean;
}

export class LoaderReport {
  public static generateReport(metrics: LoaderMetrics): string {
    return `=== KNOWLEDGE ENGINE LOADER REPORT ===
Status: ${metrics.isEngineReady ? 'READY' : 'INITIALIZING'}
Load Time: ${metrics.loadDurationMs}ms
Domains Discovered: ${metrics.totalDomainsDiscovered}
Files Discovered: ${metrics.totalFilesDiscovered}
Valid Records Loaded: ${metrics.totalRecordsLoaded}
Records Skipped: ${metrics.totalRecordsSkipped}
Indexes Built: ${metrics.totalIndexesBuilt}
Duplicates Detected: ${metrics.totalDuplicatesDetected}
======================================`;
  }
}
