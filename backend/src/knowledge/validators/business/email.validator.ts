import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export class EmailValidator implements IKnowledgeValidator {
  public readonly validatorName = 'EmailValidator';
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    const recordId = record?.identity?.id || 'UNKNOWN';
    const emailCandidate = record?.domain_attributes?.email;

    if (emailCandidate && !EmailValidator.EMAIL_REGEX.test(String(emailCandidate))) {
      details.push({
        validationId: `ERR_EMAIL_${Date.now()}`,
        domain: context.domain,
        fileName: context.fileName,
        recordId,
        field: 'domain_attributes.email',
        validatorName: this.validatorName,
        severity: 'ERROR',
        expectedValue: 'valid email address format e.g. user@domain.com',
        actualValue: emailCandidate,
        description: `Invalid email address syntax "${emailCandidate}"`,
        suggestion: 'Provide a valid email address string',
        timestamp: new Date().toISOString(),
      });
    }

    return details;
  }
}

export class PhoneValidator implements IKnowledgeValidator {
  public readonly validatorName = 'PhoneValidator';
  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    return [];
  }
}

export class AddressValidator implements IKnowledgeValidator {
  public readonly validatorName = 'AddressValidator';
  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    return [];
  }
}

export class TagValidator implements IKnowledgeValidator {
  public readonly validatorName = 'TagValidator';
  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    return [];
  }
}
