export interface IKnowledgeResolverConfig {
  enabled: boolean;
  enableCache: boolean;
  cacheTtlMs: number;
  maxCacheSize: number;
  minConfidenceThreshold: number;
}

export const DEFAULT_KNOWLEDGE_RESOLVER_CONFIG: IKnowledgeResolverConfig = {
  enabled: true,
  enableCache: true,
  cacheTtlMs: 300000,
  maxCacheSize: 500,
  minConfidenceThreshold: 0.70,
};
