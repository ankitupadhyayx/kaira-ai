import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export class DataTypeValidator implements IKnowledgeValidator {
  public readonly validatorName = 'DataTypeValidator';

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    const recordId = record?.identity?.id || 'UNKNOWN';

    if (record?.metadata?.confidence !== undefined && typeof record.metadata.confidence !== 'number') {
      details.push({
        validationId: `ERR_TYPE_${Date.now()}`,
        domain: context.domain,
        fileName: context.fileName,
        recordId,
        field: 'metadata.confidence',
        validatorName: this.validatorName,
        severity: 'ERROR',
        expectedValue: 'number (0.0 to 1.0)',
        actualValue: typeof record.metadata.confidence,
        description: 'metadata.confidence must be a number between 0.0 and 1.0',
        suggestion: 'Provide numeric value for metadata.confidence',
        timestamp: new Date().toISOString(),
      });
    }

    return details;
  }
}
