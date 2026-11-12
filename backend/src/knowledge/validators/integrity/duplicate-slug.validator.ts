import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export class DuplicateSlugValidator implements IKnowledgeValidator {
  public readonly validatorName = 'DuplicateSlugValidator';

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    const slug = record?.identity?.slug;
    if (!slug) return details;

    const recordId = record?.identity?.id || 'UNKNOWN';

    if (context.knownSlugs.has(slug)) {
      details.push({
        validationId: `ERR_DUP_SLUG_${Date.now()}`,
        domain: context.domain,
        fileName: context.fileName,
        recordId,
        field: 'identity.slug',
        validatorName: this.validatorName,
        severity: 'ERROR',
        actualValue: slug,
        description: `Duplicate Slug "${slug}" detected across domain records`,
        suggestion: 'Ensure every record slug is unique',
        timestamp: new Date().toISOString(),
      });
    } else {
      context.knownSlugs.add(slug);
    }

    return details;
  }
}
