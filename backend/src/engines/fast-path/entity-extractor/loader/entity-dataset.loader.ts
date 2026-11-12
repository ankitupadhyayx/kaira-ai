import fs from 'fs';
import path from 'path';
import { IEntityLoader } from '../contracts/entity-loader.interface';
import { IEntityValidator } from '../contracts/entity-validator.interface';
import { EntityDatasetValidator } from '../validator/entity-dataset.validator';
import { EntityDomainDataset, EntityType } from '../types/entity-definition.types';

export class EntityDatasetLoader implements IEntityLoader {
  private readonly entitiesDir: string;
  private readonly validator: IEntityValidator;

  constructor(entitiesDir?: string, validator?: IEntityValidator) {
    this.entitiesDir = entitiesDir || path.resolve(process.cwd(), 'src/knowledge/entities');
    this.validator = validator || new EntityDatasetValidator();
  }

  public loadDomainDataset(domain: EntityType): EntityDomainDataset {
    const filename = `${domain.replace('_', '-')}.json`;
    const filePath = path.join(this.entitiesDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new Error(`[EntityDatasetLoader] Entity dataset file not found: "${filePath}".`);
    }

    try {
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(rawContent);

      const report = this.validator.validate(parsed);
      if (!report.isValid) {
        throw new Error(`[EntityDatasetLoader] Validation failed for "${domain}": ${report.errors.join('; ')}`);
      }

      return parsed as EntityDomainDataset;
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error(`[EntityDatasetLoader] Failed to load domain "${domain}": ${String(err)}`);
    }
  }

  public loadAllDomainDatasets(): Map<EntityType, EntityDomainDataset> {
    const map = new Map<EntityType, EntityDomainDataset>();

    const domains: EntityType[] = [
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

    for (const domain of domains) {
      try {
        const dataset = this.loadDomainDataset(domain);
        map.set(domain, dataset);
      } catch (err: unknown) {
        // Ignore missing optional files
      }
    }

    return map;
  }
}
