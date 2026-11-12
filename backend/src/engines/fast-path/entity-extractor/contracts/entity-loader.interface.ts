import { EntityDomainDataset, EntityType } from '../types/entity-definition.types';

export interface IEntityLoader {
  loadDomainDataset(domain: EntityType): EntityDomainDataset;
  loadAllDomainDatasets(): Map<EntityType, EntityDomainDataset>;
}
