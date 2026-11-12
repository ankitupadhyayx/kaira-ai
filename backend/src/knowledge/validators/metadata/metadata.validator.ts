import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export class MetadataValidator implements IKnowledgeValidator {
  public readonly validatorName = 'MetadataValidator';

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    const createdAt = record?.metadata?.created_at;
    const recordId = record?.identity?.id || 'UNKNOWN';

    if (createdAt && isNaN(Date.parse(createdAt))) {
      details.push({
        validationId: `ERR_DATE_${Date.now()}`,
        domain: context.domain,
        fileName: context.fileName,
        recordId,
        field: 'metadata.created_at',
        validatorName: this.validatorName,
        severity: 'ERROR',
        expectedValue: 'ISO 8601 timestamp string',
        actualValue: createdAt,
        description: `Invalid created_at timestamp string "${createdAt}"`,
        suggestion: 'Provide a valid ISO 8601 timestamp',
        timestamp: new Date().toISOString(),
      });
    }

    return details;
  }
}
