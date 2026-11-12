import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationErrorDetail } from '../../schemas/shared/reusable-validators/validation-error.types';

export class URLValidator implements IKnowledgeValidator {
  public readonly validatorName = 'URLValidator';

  public validate(record: any, context: ValidationContext): ValidationErrorDetail[] {
    const details: ValidationErrorDetail[] = [];
    const urls: string[] = [
      ...(record?.references?.official_references || []),
      ...(record?.references?.documentation_urls || []),
      ...(record?.references?.external_references || []),
    ];
    const recordId = record?.identity?.id || 'UNKNOWN';

    for (const url of urls) {
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://')) {
        details.push({
          validationId: `ERR_URL_${Date.now()}`,
          domain: context.domain,
          fileName: context.fileName,
          recordId,
          field: 'references',
          validatorName: this.validatorName,
          severity: 'WARNING',
          expectedValue: 'URL starting with http://, https://, or file://',
          actualValue: url,
          description: `Invalid URL protocol in reference "${url}"`,
          suggestion: 'Ensure reference URLs start with valid http://, https://, or file:// scheme',
          timestamp: new Date().toISOString(),
        });
      }
    }

    return details;
  }
}
