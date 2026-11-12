export interface ValidationErrorDetail {
  validationId?: string;
  domain: string;
  fileName: string;
  recordId?: string;
  field?: string;
  fieldName?: string;
  validatorName?: string;
  errorType?: string;
  expectedValue?: string;
  actualValue?: unknown;
  description?: string;
  message?: string;
  suggestion?: string;
  severity: 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO';
  timestamp: string;
}

export interface ValidationErrorReport {
  isValid: boolean;
  domain: string;
  totalRecordsChecked: number;
  totalErrors: number;
  totalWarnings: number;
  errors: ValidationErrorDetail[];
  timestamp: string;
}
