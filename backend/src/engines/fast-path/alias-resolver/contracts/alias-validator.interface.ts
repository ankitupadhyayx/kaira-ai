import { AliasDataset } from '../types/alias-dataset.types';

export interface ValidationReport {
  isValid: boolean;
  datasetId?: string;
  errors: string[];
  warnings: string[];
}

export interface IAliasDatasetValidator {
  validate(dataset: unknown): ValidationReport;
}
