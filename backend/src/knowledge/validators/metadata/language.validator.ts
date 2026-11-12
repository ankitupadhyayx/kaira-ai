import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export class LanguageValidator implements IKnowledgeValidator {
  public readonly validatorName = 'LanguageValidator';
  private static readonly VALID_LANG_CODES = new Set(['en', 'hi', 'es', 'fr', 'de', 'ja', 'zh']);

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    const lang = record?.metadata?.language;
    const recordId = record?.identity?.id || 'UNKNOWN';

    if (lang && !LanguageValidator.VALID_LANG_CODES.has(lang.toLowerCase())) {
      details.push({
        validationId: `ERR_LANG_${Date.now()}`,
        domain: context.domain,
        fileName: context.fileName,
        recordId,
        field: 'metadata.language',
        validatorName: this.validatorName,
        severity: 'WARNING',
        expectedValue: 'ISO language code e.g. "en" or "hi"',
        actualValue: lang,
        description: `Unsupported language code "${lang}"`,
        suggestion: 'Use a standard 2-letter ISO 639-1 language code',
        timestamp: new Date().toISOString(),
      });
    }

    return details;
  }
}
