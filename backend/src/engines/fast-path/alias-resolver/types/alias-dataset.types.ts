export type AliasDatasetType =
  | 'aliases'
  | 'synonyms'
  | 'abbreviations'
  | 'acronyms'
  | 'keyboard_mistakes'
  | 'spelling_variants'
  | 'hinglish_variants'
  | 'multilingual_variants'
  | 'phonetic_variants';

export interface AliasEntry {
  term: string;
  canonical: string;
  confidence: number;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface AliasDataset {
  datasetId: AliasDatasetType;
  name: string;
  version: string;
  description: string;
  entries: AliasEntry[];
  metadata?: Record<string, unknown>;
}
