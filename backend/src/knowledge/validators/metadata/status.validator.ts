import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export class StatusValidator implements IKnowledgeValidator {
  public readonly validatorName = 'StatusValidator';
  private static readonly VALID_STATUSES = new Set(['active', 'deprecated', 'draft', 'archived']);

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    const status = record?.status;
    const recordId = record?.identity?.id || 'UNKNOWN';

    if (status && !StatusValidator.VALID_STATUSES.has(status)) {
      details.push({
        validationId: `ERR_STATUS_${Date.now()}`,
        domain: context.domain,
        fileName: context.fileName,
        recordId,
        field: 'status',
        validatorName: this.validatorName,
        severity: 'ERROR',
        expectedValue: 'active | deprecated | draft | archived',
        actualValue: status,
        description: `Invalid record status "${status}"`,
        suggestion: 'Set status to one of: active, deprecated, draft, archived',
        timestamp: new Date().toISOString(),
      });
    }

    return details;
  }
}
