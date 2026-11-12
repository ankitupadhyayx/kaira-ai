import { AliasDatasetType } from './alias-dataset.types';

export interface TermResolution {
  originalTerm: string;
  resolvedTerm: string;
  datasetId: AliasDatasetType;
  confidence: number;
  category?: string;
  applied: boolean;
}

export interface AliasResolutionResult {
  originalQuery: string;
  resolvedQuery: string;
  resolutions: TermResolution[];
  hasChanges: boolean;
  resolutionLatencyMs: number;
  activeDatasetsCount: number;
  metadata: Record<string, unknown>;
}
