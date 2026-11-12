import { ProcessingContext } from '../../../normalization/types/processing-context.types';
import { GreetingDetectionDetails } from '../types/greeting.types';

export class GreetingValidator {
  public validateContext(context: ProcessingContext): { isValid: boolean; reason?: string } {
    if (!context) {
      return { isValid: false, reason: 'Processing context is null or undefined' };
    }
    if (typeof context.normalizedQuery !== 'string') {
      return { isValid: false, reason: 'Normalized query must be a string' };
    }
    if (!Array.isArray(context.normalizedTokens)) {
      return { isValid: false, reason: 'Normalized tokens must be an array' };
    }
    return { isValid: true };
  }

  public validateDetection(detection: GreetingDetectionDetails): { isValid: boolean; reason?: string } {
    if (!detection) {
      return { isValid: false, reason: 'Detection details are null or undefined' };
    }
    if (typeof detection.detected !== 'boolean') {
      return { isValid: false, reason: 'Detected flag must be a boolean' };
    }
    if (detection.confidence < 0 || detection.confidence > 1) {
      return { isValid: false, reason: 'Confidence score must be between 0.0 and 1.0' };
    }
    return { isValid: true };
  }
}

export const greetingValidator = new GreetingValidator();
