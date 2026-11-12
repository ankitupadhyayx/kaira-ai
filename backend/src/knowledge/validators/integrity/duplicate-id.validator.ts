import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export class DuplicateIdValidator implements IKnowledgeValidator {
  public readonly validatorName = 'DuplicateIdValidator';

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    const id = record?.identity?.id;
    if (!id) return details;

    if (context.knownIds.has(id)) {
      details.push({
        validationId: `ERR_DUP_ID_${Date.now()}`,
        domain: context.domain,
        fileName: context.fileName,
        recordId: id,
        field: 'identity.id',
        validatorName: this.validatorName,
        severity: 'CRITICAL',
        actualValue: id,
        description: `Duplicate Record ID "${id}" detected across domain knowledge records`,
        suggestion: 'Ensure every record ID is globally unique',
        timestamp: new Date().toISOString(),
      });
    } else {
      context.knownIds.add(id);
    }

    return details;
  }
}
