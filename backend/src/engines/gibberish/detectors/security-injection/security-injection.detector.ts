import { IDetector } from '../base-detector';
import { ProcessingContext } from '../../../../normalization/types/processing-context.types';
import { DetectorResult } from '../../types/gibberish.types';

export class SecurityInjectionDetector implements IDetector {
  public readonly name = 'SECURITY_INJECTION_DETECTOR';

  public detect(context: ProcessingContext): DetectorResult {
    const raw = (context.originalQuery || '').trim();
    const clean = (context.cleanQuery || raw).toLowerCase();

    const sqlPattern = /(select\s+[\s\S]+?\s+from|drop\s+table|union\s+select|insert\s+into|delete\s+from|'\s*or\s+)/i;
    const htmlScriptPattern = /(<script|<iframe|<div|onclick\s*\(|alert\s*\()/i;

    const hasSql = sqlPattern.test(raw) || sqlPattern.test(clean);
    const hasScript = htmlScriptPattern.test(raw) || htmlScriptPattern.test(clean);

    if (hasSql || hasScript) {
      return {
        detectorName: this.name,
        score: 0.98,
        confidence: 0.98,
        matchedReason: 'SYMBOL_NOISE',
        metadata: { hasSql, hasScript },
      };
    }

    return {
      detectorName: this.name,
      score: 0.0,
      confidence: 0.0,
      matchedReason: 'NORMAL_TEXT',
      metadata: {},
    };
  }
}
