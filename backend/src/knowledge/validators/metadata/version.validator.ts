import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export class VersionValidator implements IKnowledgeValidator {
  public readonly validatorName = 'VersionValidator';

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    const version = record?.metadata?.version;
    const recordId = record?.identity?.id || 'UNKNOWN';

    if (version && !/^\d+\.\d+\.\d+$/.test(version)) {
      details.push({
        validationId: `ERR_VER_${Date.now()}`,
        domain: context.domain,
        fileName: context.fileName,
        recordId,
        field: 'metadata.version',
        validatorName: this.validatorName,
        severity: 'WARNING',
        expectedValue: 'semver string e.g. "1.0.0"',
        actualValue: version,
        description: `Invalid version syntax "${version}". Must follow semver format`,
        suggestion: 'Format metadata.version as major.minor.patch (e.g. 1.0.0)',
        timestamp: new Date().toISOString(),
      });
    }

    return details;
  }
}
