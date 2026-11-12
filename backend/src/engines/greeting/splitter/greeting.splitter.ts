import { ProcessingContext } from '../../../normalization/types/processing-context.types';
import { GreetingDetectionDetails } from '../types/greeting.types';

export interface SplitterResult {
  greetingText: string;
  residualQuery: string;
  residualTokens: string[];
  residualContext?: ProcessingContext;
}

export class GreetingSplitter {
  public split(detection: GreetingDetectionDetails, context: ProcessingContext): SplitterResult {
    if (!detection.detected || !detection.span) {
      return {
        greetingText: '',
        residualQuery: context.normalizedQuery,
        residualTokens: context.normalizedTokens,
        residualContext: context,
      };
    }

    const greetingText = detection.span.matchedText;
    const residualQuery = detection.residualQuery;
    const residualTokens = detection.residualTokens;

    // Build residual ProcessingContext forwarding clean residual tokens & query
    const residualContext: ProcessingContext = {
      ...context,
      originalQuery: residualQuery || context.originalQuery,
      normalizedQuery: residualQuery,
      cleanQuery: residualQuery,
      tokens: Object.freeze([...residualTokens]) as unknown as string[],
      normalizedTokens: Object.freeze([...residualTokens]) as unknown as string[],
      correctedTokens: Object.freeze([...residualTokens]) as unknown as string[],
    };

    return {
      greetingText,
      residualQuery,
      residualTokens,
      residualContext,
    };
  }
}
