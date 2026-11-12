import { IKnowledgeResolver } from '../contracts/knowledge-resolver.interface';
import { IKnowledgeProvider } from '../contracts/knowledge-provider.interface';
import { IKnowledgeCache } from '../contracts/knowledge-cache.interface';
import { KnowledgeInMemoryCache } from '../caching/knowledge-in-memory.cache';
import { DEFAULT_KNOWLEDGE_RESOLVER_CONFIG, IKnowledgeResolverConfig } from '../config/knowledge-resolver.config';
import { KnowledgeContext } from '../types/knowledge-context.types';
import { KnowledgeResult } from '../types/knowledge-result.types';

export class EnterpriseKnowledgeResolver implements IKnowledgeResolver {
  private config: IKnowledgeResolverConfig;
  private readonly cache: IKnowledgeCache;
  private readonly providers: IKnowledgeProvider[] = [];

  constructor(
    config?: Partial<IKnowledgeResolverConfig>,
    cache?: IKnowledgeCache,
    providers: IKnowledgeProvider[] = []
  ) {
    this.config = { ...DEFAULT_KNOWLEDGE_RESOLVER_CONFIG, ...config };
    this.cache = cache || new KnowledgeInMemoryCache(this.config.maxCacheSize, this.config.cacheTtlMs);
    providers.forEach((p) => this.registerProvider(p));
  }

  public registerProvider(provider: IKnowledgeProvider): void {
    const exists = this.providers.some((p) => p.providerName === provider.providerName);
    if (!exists) {
      this.providers.push(provider);
      this.providers.sort((a, b) => a.priority - b.priority);
    }
  }

  public async resolveKnowledge(context: KnowledgeContext): Promise<KnowledgeResult> {
    const startTime = Date.now();

    if (!this.config.enabled || !context || !context.intentId) {
      return this.buildNotFoundResult(context, Date.now() - startTime, 'Disabled or missing context');
    }

    const cacheKey = `${context.intentId}:${(context.normalizedQuery || '').toLowerCase()}`;

    if (this.config.enableCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const eligibleProviders = this.providers.filter((p) => p.canHandle(context));

    for (const provider of eligibleProviders) {
      try {
        const result = await provider.fetchKnowledge(context);
        if (result && result.status === 'RESOLVED' && result.confidence >= this.config.minConfidenceThreshold) {
          if (this.config.enableCache) {
            this.cache.set(cacheKey, result);
          }
          return result;
        }
      } catch (err: unknown) {
        // Log error and continue to next provider fallback
      }
    }

    return this.buildNotFoundResult(context, Date.now() - startTime, 'No provider resolved knowledge');
  }

  public getConfig(): IKnowledgeResolverConfig {
    return { ...this.config };
  }

  public updateConfig(overrides: Partial<IKnowledgeResolverConfig>): void {
    this.config = { ...this.config, ...overrides };
  }

  public getCacheStats() {
    return this.cache.getStats();
  }

  private buildNotFoundResult(context: KnowledgeContext, latencyMs: number, reason: string): KnowledgeResult {
    return {
      status: 'NOT_FOUND',
      contextIntentId: context?.intentId || 'UNKNOWN',
      records: [],
      primaryRecord: null,
      confidence: 0.0,
      providerName: 'NONE',
      resolutionLatencyMs: latencyMs,
      cacheHit: false,
      metadata: { reason },
    };
  }
}
