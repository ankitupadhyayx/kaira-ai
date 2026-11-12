import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export class SearchPhraseValidator implements IKnowledgeValidator {
  public readonly validatorName = 'SearchPhraseValidator';

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    const phrases: string[] = record?.search?.search_phrases || [];
    const recordId = record?.identity?.id || 'UNKNOWN';

    for (const phrase of phrases) {
      if (phrase.trim().length === 0) {
        details.push({
          validationId: `ERR_EMPTY_PHRASE_${Date.now()}`,
          domain: context.domain,
          fileName: context.fileName,
          recordId,
          field: 'search.search_phrases',
          validatorName: this.validatorName,
          severity: 'INFO',
          description: 'Empty phrase detected in search.search_phrases',
          suggestion: 'Remove empty phrase entries',
          timestamp: new Date().toISOString(),
        });
      }
    }

    return details;
  }
}

export class HinglishValidator implements IKnowledgeValidator {
  public readonly validatorName = 'HinglishValidator';

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    return [];
  }
}

export class MisspellingValidator implements IKnowledgeValidator {
  public readonly validatorName = 'MisspellingValidator';

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    return [];
  }
}
