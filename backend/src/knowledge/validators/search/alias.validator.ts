import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export class AliasValidator implements IKnowledgeValidator {
  public readonly validatorName = 'AliasValidator';

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    const aliases: string[] = record?.search?.aliases || [];
    const recordId = record?.identity?.id || 'UNKNOWN';

    for (const alias of aliases) {
      if (alias.trim().length === 0) {
        details.push({
          validationId: `ERR_EMPTY_ALIAS_${Date.now()}`,
          domain: context.domain,
          fileName: context.fileName,
          recordId,
          field: 'search.aliases',
          validatorName: this.validatorName,
          severity: 'WARNING',
          description: 'Empty string detected in search.aliases array',
          suggestion: 'Remove empty strings from aliases array',
          timestamp: new Date().toISOString(),
        });
      }
    }

    return details;
  }
}
