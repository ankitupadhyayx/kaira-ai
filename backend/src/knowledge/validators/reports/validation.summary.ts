import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export interface ValidationContext {
  domain: string;
  fileName: string;
  knownIds: Set<string>;
  knownSlugs: Set<string>;
  knownAliases: Map<string, string>; // alias -> recordId
  allRecordsMap: Map<string, any>;   // recordId -> record
}

export interface IKnowledgeValidator {
  readonly validatorName: string;
  validate(record: any, context: ValidationContext): ValidationErrorDetail[];
}

export interface ValidationSummary {
  totalFilesChecked: number;
  totalRecordsChecked: number;
  passed: boolean;
  warnings: number;
  errors: number;
  criticalErrors: number;
  validationTimeMs: number;
  summary: string;
}
