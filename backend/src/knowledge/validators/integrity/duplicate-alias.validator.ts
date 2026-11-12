import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export class DuplicateAliasValidator implements IKnowledgeValidator {
  public readonly validatorName = 'DuplicateAliasValidator';

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    const aliases: string[] = record?.search?.aliases || [];
    const recordId = record?.identity?.id || 'UNKNOWN';

    for (const alias of aliases) {
      const normalized = alias.trim().toLowerCase();
      if (!normalized) continue;

      const existingOwner = context.knownAliases.get(normalized);
      if (existingOwner && existingOwner !== recordId) {
        details.push({
          validationId: `ERR_DUP_ALIAS_${Date.now()}`,
          domain: context.domain,
          fileName: context.fileName,
          recordId,
          field: 'search.aliases',
          validatorName: this.validatorName,
          severity: 'WARNING',
          actualValue: alias,
          description: `Duplicate alias "${alias}" already registered under record "${existingOwner}"`,
          suggestion: 'Deduplicate search aliases across domain records',
          timestamp: new Date().toISOString(),
        });
      } else {
        context.knownAliases.set(normalized, recordId);
      }
    }

    return details;
  }
}
