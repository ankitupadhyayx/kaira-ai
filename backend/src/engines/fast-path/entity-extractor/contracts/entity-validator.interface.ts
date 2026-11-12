export interface EntityValidationReport {
  isValid: boolean;
  domain?: string;
  errors: string[];
  warnings: string[];
}

export interface IEntityValidator {
  validate(dataset: unknown): EntityValidationReport;
}
