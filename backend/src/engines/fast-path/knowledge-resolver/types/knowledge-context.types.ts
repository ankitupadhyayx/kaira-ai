import { ExtractedEntity } from '../../entity-extractor/types/entity-extraction.types';

export interface KnowledgeContext {
  intentId: string;
  category?: string;
  query: string;
  normalizedQuery: string;
  language: string;
  entities: ExtractedEntity[];
  parameters: Record<string, unknown>;
  sessionMetadata: Record<string, unknown>;
}
