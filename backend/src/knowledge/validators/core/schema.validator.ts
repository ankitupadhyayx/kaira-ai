import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';
import { UniversalKnowledgeRecordSchema } from '../../schemas/universal-knowledge-record.schema';

export class SchemaValidator implements IKnowledgeValidator {
  public readonly validatorName = 'SchemaValidator';

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    const result = UniversalKnowledgeRecordSchema.safeParse(record);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const fieldName = issue.path.join('.') || 'root';
        details.push({
          validationId: `ERR_SCHEMA_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          domain: context.domain,
          fileName: context.fileName,
          recordId: record?.identity?.id || 'UNKNOWN',
          field: fieldName,
          validatorName: this.validatorName,
          severity: 'ERROR',
          description: `Schema validation error: ${issue.message}`,
          suggestion: `Ensure field "${fieldName}" satisfies Zod schema requirements`,
          timestamp: new Date().toISOString(),
        });
      }
    }
    return details;
  }
}
