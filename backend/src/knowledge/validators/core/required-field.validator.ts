import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export class RequiredFieldValidator implements IKnowledgeValidator {
  public readonly validatorName = 'RequiredFieldValidator';

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    const recordId = record?.identity?.id || 'UNKNOWN';

    if (!record?.identity?.id) {
      details.push(this.createError(context, recordId, 'identity.id', 'Missing required identity.id'));
    }
    if (!record?.identity?.slug) {
      details.push(this.createError(context, recordId, 'identity.slug', 'Missing required identity.slug'));
    }
    if (!record?.content?.title) {
      details.push(this.createError(context, recordId, 'content.title', 'Missing required content.title'));
    }

    return details;
  }

  private createError(context: ValidationContext, recordId: string, field: string, msg: string): ValidationErrorDetail {
    return {
      validationId: `ERR_REQ_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      domain: context.domain,
      fileName: context.fileName,
      recordId,
      field,
      validatorName: this.validatorName,
      severity: 'CRITICAL',
      description: msg,
      suggestion: `Provide a non-empty string for "${field}"`,
      timestamp: new Date().toISOString(),
    };
  }
}
