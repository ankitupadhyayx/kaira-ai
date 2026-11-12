import { EntityType } from './entity-definition.types';

export interface ExtractedEntity {
  entityId: string;
  type: EntityType;
  name: string;
  canonical: string;
  matchedText: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
  attributes: Record<string, unknown>;
}

export interface EntityExtractionResult {
  originalQuery: string;
  entities: ExtractedEntity[];
  entityCount: number;
  entityTypesFound: EntityType[];
  extractionLatencyMs: number;
  metadata: Record<string, unknown>;
}
