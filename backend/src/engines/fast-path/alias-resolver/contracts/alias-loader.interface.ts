import { AliasDataset, AliasDatasetType } from '../types/alias-dataset.types';

export interface IAliasDatasetLoader {
  loadDataset(type: AliasDatasetType): AliasDataset;
  loadAllDatasets(): Map<AliasDatasetType, AliasDataset>;
}
