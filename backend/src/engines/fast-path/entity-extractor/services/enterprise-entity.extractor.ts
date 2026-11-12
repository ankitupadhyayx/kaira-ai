import { IEntityExtractor } from '../contracts/entity-extractor.interface';
import { IEntityLoader } from '../contracts/entity-loader.interface';
import { EntityDatasetLoader } from '../loader/entity-dataset.loader';
import { EntityIndexCache } from '../caching/entity-index.cache';
import { LongestMatchEntityMatcher } from '../matcher/longest-match.entity-matcher';
import { DEFAULT_ENTITY_EXTRACTOR_CONFIG, IEntityExtractorConfig } from '../config/entity-extractor.config';
import { EntityDomainDataset, EntityType } from '../types/entity-definition.types';
import { EntityExtractionResult, ExtractedEntity } from '../types/entity-extraction.types';

export class EnterpriseEntityExtractor implements IEntityExtractor {
  private config: IEntityExtractorConfig;
  private readonly loader: IEntityLoader;
  private readonly cache: EntityIndexCache;
  private readonly matcher: LongestMatchEntityMatcher;

  constructor(
    config?: Partial<IEntityExtractorConfig>,
    loader?: IEntityLoader,
    cache?: EntityIndexCache,
    matcher?: LongestMatchEntityMatcher
  ) {
    this.config = { ...DEFAULT_ENTITY_EXTRACTOR_CONFIG, ...config };
    this.loader = loader || new EntityDatasetLoader(this.config.entitiesPath);
    this.cache = cache || new EntityIndexCache();
    this.matcher = matcher || new LongestMatchEntityMatcher(this.cache);

    this.initializeEntities();
  }

  public initializeEntities(): void {
    const loadedDatasets = this.loader.loadAllDomainDatasets();
    const activeDomainMap = new Map<EntityType, EntityDomainDataset['entities']>();

    for (const [domain, dataset] of loadedDatasets.entries()) {
      if (this.config.enabledEntityTypes.includes(domain) && dataset && dataset.entities) {
        activeDomainMap.set(domain, dataset.entities);
      }
    }

    this.cache.indexEntities(activeDomainMap);
  }

  public extractEntities(rawQuery: string, _sessionId?: string): EntityExtractionResult {
    const startTime = Date.now();
    const query = (rawQuery || '').trim();

    if (!this.config.enabled || !query) {
      return {
        originalQuery: query,
        entities: [],
        entityCount: 0,
        entityTypesFound: [],
        extractionLatencyMs: Date.now() - startTime,
        metadata: { reason: 'Disabled or empty query' },
      };
    }

    // Match spans using Longest-Match-First strategy
    const rawExtracted = this.matcher.matchSpans(query);

    // Filter by min confidence and enabled entity types
    const filteredEntities: ExtractedEntity[] = rawExtracted.filter(
      (e) => e.confidence >= this.config.minConfidence && this.config.enabledEntityTypes.includes(e.type)
    );

    const typesSet = new Set<EntityType>();
    for (const entity of filteredEntities) {
      typesSet.add(entity.type);
    }

    const latencyMs = Date.now() - startTime;

    return {
      originalQuery: query,
      entities: filteredEntities,
      entityCount: filteredEntities.length,
      entityTypesFound: Array.from(typesSet),
      extractionLatencyMs: latencyMs,
      metadata: {
        indexedEntitiesCount: this.cache.size(),
      },
    };
  }

  public getConfig(): IEntityExtractorConfig {
    return { ...this.config };
  }

  public updateConfig(overrides: Partial<IEntityExtractorConfig>): void {
    this.config = { ...this.config, ...overrides };
    this.initializeEntities();
  }
}
