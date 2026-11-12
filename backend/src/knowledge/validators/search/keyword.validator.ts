import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export class KeywordValidator implements IKnowledgeValidator {
  public readonly validatorName = 'KeywordValidator';

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    const keywords: string[] = record?.search?.keywords || [];
    const recordId = record?.identity?.id || 'UNKNOWN';

    const seen = new Set<string>();
    for (const kw of keywords) {
      const normalized = kw.trim().toLowerCase();
      if (!normalized) continue;
      if (seen.has(normalized)) {
        details.push({
          validationId: `ERR_KEYWORD_DUP_${Date.now()}`,
          domain: context.domain,
          fileName: context.fileName,
          recordId,
          field: 'search.keywords',
          validatorName: this.validatorName,
          severity: 'WARNING',
          actualValue: kw,
          description: `Duplicate keyword "${kw}" inside record "${recordId}"`,
          suggestion: 'Remove duplicate keyword from record keywords array',
          timestamp: new Date().toISOString(),
        });
      } else {
        seen.add(normalized);
      }
    }

    return details;
  }
}
