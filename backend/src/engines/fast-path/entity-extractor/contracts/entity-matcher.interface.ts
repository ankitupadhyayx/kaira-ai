import { EntityDefinition } from '../types/entity-definition.types';
import { ExtractedEntity } from '../types/entity-extraction.types';

export interface IEntityMatcher {
  matchSpans(query: string, entities: EntityDefinition[]): ExtractedEntity[];
}
