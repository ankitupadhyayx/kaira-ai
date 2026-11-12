import { EntityExtractionResult } from '../types/entity-extraction.types';

export interface IEntityExtractor {
  extractEntities(query: string, sessionId?: string): EntityExtractionResult;
}
