export type EntityType =
  | 'leadership'
  | 'services'
  | 'technologies'
  | 'products'
  | 'departments'
  | 'offices'
  | 'locations'
  | 'programming_languages'
  | 'frameworks'
  | 'databases'
  | 'cloud_providers'
  | 'certifications'
  | 'industries';

export interface EntityDefinition {
  entityId: string;
  type: EntityType;
  name: string;
  canonical: string;
  aliases: string[];
  category: string;
  attributes: Record<string, unknown>;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface EntityDomainDataset {
  domain: EntityType;
  version: string;
  description: string;
  entities: EntityDefinition[];
  metadata?: Record<string, unknown>;
}
