import { IDetector } from '../base-detector';
import { ProcessingContext } from '../../../../normalization/types/processing-context.types';
import { DetectorResult } from '../../types/gibberish.types';

export class UrlSpamDetector implements IDetector {
  public readonly name = 'URL_SPAM_DETECTOR';

  public detect(context: ProcessingContext): DetectorResult {
    const raw = (context.originalQuery || '').trim();

    const urlPattern = /https?:\/\/[^\s]+/i;

    if (urlPattern.test(raw)) {
      const match = raw.match(urlPattern)?.[0] || '';
      const domainPart = match.replace(/^https?:\/\//i, '').split('/')[0];
      const isRandomDomain = (domainPart.length > 5 && !domainPart.includes('.')) || /^([a-z])\1+$/i.test(domainPart);

      if (isRandomDomain || match.length > 30) {
        return {
          detectorName: this.name,
          score: 0.90,
          confidence: 0.90,
          matchedReason: 'RANDOM_CHARACTERS',
          metadata: { url: match },
        };
      }
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
