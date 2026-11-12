import { IAliasResolver } from '../contracts/alias-resolver.interface';
import { IAliasDatasetLoader } from '../contracts/alias-loader.interface';
import { AliasDatasetLoader } from '../loader/alias-dataset.loader';
import { AliasResolutionCache } from '../caching/alias-resolution.cache';
import { DEFAULT_ALIAS_RESOLVER_CONFIG, IAliasResolverConfig } from '../config/alias-resolver.config';
import { AliasDatasetType } from '../types/alias-dataset.types';
import { AliasResolutionResult, TermResolution } from '../types/alias-resolution.types';

export class EnterpriseAliasResolver implements IAliasResolver {
  private config: IAliasResolverConfig;
  private readonly loader: IAliasDatasetLoader;
  private readonly cache: AliasResolutionCache;
  private activeDatasetsInPriorityOrder: AliasDatasetType[] = [];

  constructor(
    config?: Partial<IAliasResolverConfig>,
    loader?: IAliasDatasetLoader,
    cache?: AliasResolutionCache
  ) {
    this.config = { ...DEFAULT_ALIAS_RESOLVER_CONFIG, ...config };
    this.loader = loader || new AliasDatasetLoader(this.config.datasetsPath);
    this.cache = cache || new AliasResolutionCache();

    this.initializeDatasets();
  }

  public initializeDatasets(): void {
    const loadedDatasets = this.loader.loadAllDatasets();

    // Index all loaded datasets into the cache
    for (const [type, dataset] of loadedDatasets.entries()) {
      if (dataset && dataset.entries) {
        this.cache.setDataset(type, dataset.entries);
      }
    }

    // Determine active datasets ordered by priority
    this.activeDatasetsInPriorityOrder = (Object.keys(this.config.datasetConfigs) as AliasDatasetType[])
      .filter((type) => this.config.datasetConfigs[type]?.enabled)
      .sort((a, b) => this.config.datasetConfigs[a].priority - this.config.datasetConfigs[b].priority);
  }

  public resolveQuery(rawQuery: string, _sessionId?: string): AliasResolutionResult {
    const startTime = Date.now();
    const query = (rawQuery || '').trim();

    if (!this.config.enabled || !query) {
      return {
        originalQuery: query,
        resolvedQuery: query,
        resolutions: [],
        hasChanges: false,
        resolutionLatencyMs: Date.now() - startTime,
        activeDatasetsCount: this.activeDatasetsInPriorityOrder.length,
        metadata: { reason: 'Disabled or empty query' },
      };
    }

    const resolutions: TermResolution[] = [];
    let currentQuery = query;

    // Phase 1: Multi-word Exact Phrase Resolution across Active Datasets
    for (const type of this.activeDatasetsInPriorityOrder) {
      const config = this.config.datasetConfigs[type];
      if (!config || !config.enabled) continue;

      const normQueryLower = currentQuery.toLowerCase();

      // Check all cached entries for multi-word phrases
      // E.g., "react native", "jagdish harsh", "ram ram"
      for (const [term, entry] of this.getEntriesForType(type)) {
        if (term.includes(' ') && normQueryLower.includes(term) && entry.confidence >= config.minConfidence) {
          const regex = new RegExp(`\\b${this.escapeRegExp(term)}\\b`, 'gi');
          if (regex.test(currentQuery)) {
            currentQuery = currentQuery.replace(regex, entry.canonical);
            resolutions.push({
              originalTerm: term,
              resolvedTerm: entry.canonical,
              datasetId: type,
              confidence: entry.confidence,
              category: entry.category,
              applied: true,
            });
          }
        }
      }
    }

    // Phase 2: Single-Word Token Resolution
    const tokens = currentQuery.split(/([\s,./?!;:]+)/); // Preserve delimiters & whitespace

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (!token || /^\s*$/.test(token) || /^[\s,./?!;:]+$/.test(token)) {
        continue;
      }

      const match = this.cache.lookupAcrossAll(token, this.activeDatasetsInPriorityOrder);
      if (match) {
        const datasetConfig = this.config.datasetConfigs[match.type];
        if (datasetConfig && datasetConfig.enabled && match.entry.confidence >= datasetConfig.minConfidence) {
          // Replace token preserving original casing format if simple, otherwise canonical
          tokens[i] = match.entry.canonical;
          resolutions.push({
            originalTerm: token,
            resolvedTerm: match.entry.canonical,
            datasetId: match.type,
            confidence: match.entry.confidence,
            category: match.entry.category,
            applied: true,
          });
        }
      }
    }

    const resolvedQuery = tokens.join('');
    const hasChanges = resolvedQuery !== query;
    const latencyMs = Date.now() - startTime;

    return {
      originalQuery: query,
      resolvedQuery,
      resolutions,
      hasChanges,
      resolutionLatencyMs: latencyMs,
      activeDatasetsCount: this.activeDatasetsInPriorityOrder.length,
      metadata: {
        activePipeline: this.activeDatasetsInPriorityOrder,
      },
    };
  }

  public getConfig(): IAliasResolverConfig {
    return { ...this.config };
  }

  public updateConfig(overrides: Partial<IAliasResolverConfig>): void {
    this.config = { ...this.config, ...overrides };
    this.initializeDatasets();
  }

  private getEntriesForType(type: AliasDatasetType): Map<string, { canonical: string; confidence: number; category?: string }> {
    const map = new Map<string, { canonical: string; confidence: number; category?: string }>();
    const datasetSize = this.cache.size(type);
    if (datasetSize === 0) return map;

    // Retrieve from dataset via loader/cache
    try {
      const dataset = this.loader.loadDataset(type);
      for (const entry of dataset.entries) {
        map.set(entry.term.toLowerCase(), entry);
      }
    } catch {
      // Ignore if file missing
    }
    return map;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
