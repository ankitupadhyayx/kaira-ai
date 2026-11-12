import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export class CircularReferenceValidator implements IKnowledgeValidator {
  public readonly validatorName = 'CircularReferenceValidator';

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    const recordId = record?.identity?.id;
    const parentId = record?.relationships?.parent_id;

    if (recordId && parentId && recordId === parentId) {
      details.push({
        validationId: `ERR_CIRCULAR_REF_${Date.now()}`,
        domain: context.domain,
        fileName: context.fileName,
        recordId,
        field: 'relationships.parent_id',
        validatorName: this.validatorName,
        severity: 'CRITICAL',
        actualValue: parentId,
        description: `Self-referential circular relationship: Record "${recordId}" is set as its own parent`,
        suggestion: 'Remove self-referential parent_id',
        timestamp: new Date().toISOString(),
      });
    }

    return details;
  }
}
