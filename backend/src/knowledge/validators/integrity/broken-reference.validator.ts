import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export class BrokenReferenceValidator implements IKnowledgeValidator {
  public readonly validatorName = 'BrokenReferenceValidator';

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    const relatedIds: string[] = record?.relationships?.related_ids || [];
    const parentId: string | null = record?.relationships?.parent_id || null;
    const recordId = record?.identity?.id || 'UNKNOWN';

    if (parentId && context.allRecordsMap.size > 0 && !context.allRecordsMap.has(parentId)) {
      details.push({
        validationId: `ERR_BROKEN_REF_${Date.now()}`,
        domain: context.domain,
        fileName: context.fileName,
        recordId,
        field: 'relationships.parent_id',
        validatorName: this.validatorName,
        severity: 'ERROR',
        actualValue: parentId,
        description: `Broken parent reference: Target record ID "${parentId}" not found`,
        suggestion: 'Verify parent_id points to an existing record ID',
        timestamp: new Date().toISOString(),
      });
    }

    for (const relId of relatedIds) {
      if (context.allRecordsMap.size > 0 && !context.allRecordsMap.has(relId)) {
        details.push({
          validationId: `ERR_BROKEN_REF_${Date.now()}`,
          domain: context.domain,
          fileName: context.fileName,
          recordId,
          field: 'relationships.related_ids',
          validatorName: this.validatorName,
          severity: 'WARNING',
          actualValue: relId,
          description: `Broken related ID reference: Target record ID "${relId}" not found`,
          suggestion: 'Verify related_ids point to valid record IDs',
          timestamp: new Date().toISOString(),
        });
      }
    }

    return details;
  }
}
