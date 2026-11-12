import { IQuerySplitter } from '../contracts/query-splitter.interface';
import { MultiIntentRulesLoader } from '../loader/multi-intent-rules.loader';
import { MultiIntentRulesDataset, QuerySegment } from '../types/multi-intent.types';

export class MultiIntentQuerySplitter implements IQuerySplitter {
  private readonly rulesDataset: MultiIntentRulesDataset;

  constructor(loader?: MultiIntentRulesLoader) {
    const rulesLoader = loader || new MultiIntentRulesLoader();
    this.rulesDataset = rulesLoader.loadRulesDataset();
  }

  public splitQuery(rawQuery: string): QuerySegment[] {
    const query = (rawQuery || '').trim();
    if (!query) return [];

    const conjunctions = this.rulesDataset.conjunctions || [];
    const punctuation = this.rulesDataset.punctuationDelimiters || [];

    // Build regex pattern for conjunctions and punctuation
    const conjPatterns = conjunctions.map((c) => {
      const escaped = this.escapeRegExp(c);
      return /^[a-zA-Z0-9]/.test(c) && /[a-zA-Z0-9]$/.test(c) ? `\\b${escaped}\\b` : escaped;
    });
    const punctPatterns = punctuation.map((p) => this.escapeRegExp(p));
    const combinedPattern = new RegExp(`(?:${[...conjPatterns, ...punctPatterns].join('|')})`, 'gi');

    const rawFragments = query.split(combinedPattern);
    const segments: QuerySegment[] = [];

    let index = 0;
    for (const frag of rawFragments) {
      const cleanText = frag.trim();
      const tokens = cleanText.split(/\s+/).filter(Boolean);

      if (
        cleanText.length >= this.rulesDataset.minSegmentLengthChars &&
        tokens.length >= this.rulesDataset.minSegmentTokens
      ) {
        segments.push({
          index,
          rawSegmentText: frag.trim(),
          cleanSegmentText: cleanText,
        });
        index++;
      }
    }

    return segments.length > 0
      ? segments
      : [
          {
            index: 0,
            rawSegmentText: query,
            cleanSegmentText: query,
          },
        ];
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
