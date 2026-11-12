import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export class UnknownFieldValidator implements IKnowledgeValidator {
  public readonly validatorName = 'UnknownFieldValidator';
  private static readonly ALLOWED_TOP_LEVEL_KEYS = new Set([
    'identity',
    'content',
    'search',
    'relationships',
    'metadata',
    'status',
    'tags',
    'references',
    'future_expansion',
    'domain_attributes',
  ]);

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    if (!record || typeof record !== 'object') return details;

    const recordId = record?.identity?.id || 'UNKNOWN';
    const topLevelKeys = Object.keys(record);

    for (const key of topLevelKeys) {
      if (!UnknownFieldValidator.ALLOWED_TOP_LEVEL_KEYS.has(key)) {
        details.push({
          validationId: `ERR_UNKNOWN_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          domain: context.domain,
          fileName: context.fileName,
          recordId,
          field: key,
          validatorName: this.validatorName,
          severity: 'WARNING',
          actualValue: key,
          description: `Unknown top-level field "${key}" detected under record "${recordId}"`,
          suggestion: `Remove unknown field or place under "future_expansion" or "domain_attributes"`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return details;
  }
}
