import { AliasDatasetType } from '../types/alias-dataset.types';

export interface AliasDatasetConfig {
  enabled: boolean;
  priority: number; // lower number = higher priority
  minConfidence: number;
}

export interface IAliasResolverConfig {
  enabled: boolean;
  datasetsPath: string;
  datasetConfigs: Record<AliasDatasetType, AliasDatasetConfig>;
}

export const DEFAULT_ALIAS_RESOLVER_CONFIG: IAliasResolverConfig = {
  enabled: true,
  datasetsPath: 'src/knowledge/datasets',
  datasetConfigs: {
    acronyms: { enabled: true, priority: 1, minConfidence: 0.90 },
    aliases: { enabled: true, priority: 2, minConfidence: 0.90 },
    abbreviations: { enabled: true, priority: 3, minConfidence: 0.85 },
    keyboard_mistakes: { enabled: true, priority: 4, minConfidence: 0.85 },
    spelling_variants: { enabled: true, priority: 5, minConfidence: 0.90 },
    hinglish_variants: { enabled: true, priority: 6, minConfidence: 0.85 },
    multilingual_variants: { enabled: true, priority: 7, minConfidence: 0.90 },
    synonyms: { enabled: true, priority: 8, minConfidence: 0.85 },
    phonetic_variants: { enabled: true, priority: 9, minConfidence: 0.85 },
  },
};
