import { EntityType } from '../types/entity-definition.types';

export interface IEntityExtractorConfig {
  enabled: boolean;
  entitiesPath: string;
  enabledEntityTypes: EntityType[];
  minConfidence: number;
}

export const DEFAULT_ENTITY_EXTRACTOR_CONFIG: IEntityExtractorConfig = {
  enabled: true,
  entitiesPath: 'src/knowledge/entities',
  minConfidence: 0.85,
  enabledEntityTypes: [
    'leadership',
    'services',
    'technologies',
    'products',
    'departments',
    'offices',
    'locations',
    'programming_languages',
    'frameworks',
    'databases',
    'cloud_providers',
    'certifications',
    'industries',
  ],
};
