import { EntityValidationReport, IEntityValidator } from '../contracts/entity-validator.interface';
import { EntityDomainDataset, EntityType } from '../types/entity-definition.types';

const VALID_ENTITY_TYPES: EntityType[] = [
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
];

export class EntityDatasetValidator implements IEntityValidator {
  public validate(dataset: unknown): EntityValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!dataset || typeof dataset !== 'object') {
      return { isValid: false, errors: ['Entity dataset must be a valid object.'], warnings: [] };
    }

    const data = dataset as Partial<EntityDomainDataset>;

    if (!data.domain || typeof data.domain !== 'string') {
      errors.push('Missing or non-string "domain" property.');
    } else if (!VALID_ENTITY_TYPES.includes(data.domain as EntityType)) {
      errors.push(`Invalid entity domain "${data.domain}". Must be one of: ${VALID_ENTITY_TYPES.join(', ')}.`);
    }

    if (!data.entities || !Array.isArray(data.entities)) {
      errors.push('Missing or non-array "entities" property.');
    } else {
      const seenIds = new Set<string>();

      data.entities.forEach((entity, index) => {
        if (!entity.entityId || typeof entity.entityId !== 'string') {
          errors.push(`Entity at index ${index} missing valid "entityId".`);
        } else {
          if (seenIds.has(entity.entityId)) {
            errors.push(`Duplicate entityId "${entity.entityId}" at index ${index}.`);
          }
          seenIds.add(entity.entityId);
        }

        if (!entity.name || typeof entity.name !== 'string') {
          errors.push(`Entity at index ${index} ("${entity?.entityId}") missing valid "name".`);
        }

        if (!entity.canonical || typeof entity.canonical !== 'string') {
          errors.push(`Entity at index ${index} ("${entity?.entityId}") missing valid "canonical".`);
        }

        if (!Array.isArray(entity.aliases)) {
          errors.push(`Entity at index ${index} ("${entity?.entityId}") "aliases" must be an array.`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      domain: data.domain,
      errors,
      warnings,
    };
  }
}
