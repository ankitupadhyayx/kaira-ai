import { FileLoader } from './file.loader';
import { DomainLoader } from './domain.loader';
import { KnowledgeIndexBuilder } from '../indexes/index.builder';
import { KnowledgeCacheService } from '../cache/knowledge-cache.service';
import { BaseKnowledgeRecord } from '../schemas/base/base-knowledge.schema';
import { LoaderMetrics, LoaderReport } from './loader.metrics';
import { KnowledgeIndexes } from '../indexes/index.types';

export class KnowledgeLoader {
  private readonly fileLoader: FileLoader;
  private readonly domainLoader: DomainLoader;
  private readonly indexBuilder: KnowledgeIndexBuilder;
  private readonly cacheService: KnowledgeCacheService;

  private isReady = false;
  private metrics: LoaderMetrics = {
    totalDomainsDiscovered: 0,
    totalFilesDiscovered: 0,
    totalRecordsLoaded: 0,
    totalRecordsSkipped: 0,
    totalIndexesBuilt: 0,
    totalDuplicatesDetected: 0,
    loadDurationMs: 0,
    isEngineReady: false,
  };

  constructor(
    fileLoader?: FileLoader,
    domainLoader?: DomainLoader,
    indexBuilder?: KnowledgeIndexBuilder,
    cacheService?: KnowledgeCacheService,
  ) {
    this.fileLoader = fileLoader || new FileLoader();
    this.domainLoader = domainLoader || new DomainLoader(this.fileLoader);
    this.indexBuilder = indexBuilder || new KnowledgeIndexBuilder();
    this.cacheService = cacheService || new KnowledgeCacheService();
  }

  public executePipelineSync(): { cache: KnowledgeCacheService; metrics: LoaderMetrics } {
    const startTime = Date.now();

    // 1. Discover domains
    const domains = this.fileLoader.discoverDomains();
    this.metrics.totalDomainsDiscovered = domains.length;

    // 2. Discover JSON files
    const allFiles = this.fileLoader.discoverJsonFiles();
    this.metrics.totalFilesDiscovered = allFiles.length;

    // 3 & 4. Validate & Load Records per domain
    const allValidRecords: BaseKnowledgeRecord[] = [];
    let skippedCount = 0;

    for (const domain of domains) {
      const res = this.domainLoader.loadDomain(domain);
      allValidRecords.push(...res.validRecords);
      skippedCount += res.skippedRecordsCount;
    }

    this.metrics.totalRecordsLoaded = allValidRecords.length;
    this.metrics.totalRecordsSkipped = skippedCount;

    // 5 & 6. Duplicate Detection & Index Building
    const dupReport = this.indexBuilder.detectDuplicates(allValidRecords);
    this.metrics.totalDuplicatesDetected = dupReport.totalDuplicates;

    const indexes: KnowledgeIndexes = this.indexBuilder.buildIndexes(allValidRecords);
    this.metrics.totalIndexesBuilt = 18;

    // 7 - 11. Initialize Cache & Freeze Snapshot
    this.cacheService.initialize(allValidRecords, indexes, '1.0.0');

    // 12. Mark Engine Ready
    this.isReady = true;
    this.metrics.loadDurationMs = Date.now() - startTime;
    this.metrics.isEngineReady = true;

    return {
      cache: this.cacheService,
      metrics: this.metrics,
    };
  }

  public async executePipeline(): Promise<{ cache: KnowledgeCacheService; metrics: LoaderMetrics }> {
    return this.executePipelineSync();
  }

  public getCacheService(): KnowledgeCacheService {
    return this.cacheService;
  }

  public getMetrics(): LoaderMetrics {
    return this.metrics;
  }

  public getFormattedReport(): string {
    return LoaderReport.generateReport(this.metrics);
  }

  public isEngineReady(): boolean {
    return this.isReady;
  }
}
