import { IDetector } from '../base-detector';
import { ProcessingContext } from '../../../../normalization/types/processing-context.types';
import { DetectorResult } from '../../types/gibberish.types';

export class RandomNumberDetector implements IDetector {
  public readonly name = 'RANDOM_NUMBER_DETECTOR';

  public detect(context: ProcessingContext): DetectorResult {
    const raw = (context.originalQuery || '').trim();
    const clean = (context.cleanQuery || raw).trim();

    if (/^\d{8,}$/.test(clean)) {
      return {
        detectorName: this.name,
        score: 0.90,
        confidence: 0.90,
        matchedReason: 'RANDOM_CHARACTERS',
        metadata: { numericSequence: clean },
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
