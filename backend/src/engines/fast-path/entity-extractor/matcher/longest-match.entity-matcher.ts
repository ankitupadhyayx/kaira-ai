import { IEntityMatcher } from '../contracts/entity-matcher.interface';
import { EntityIndexCache } from '../caching/entity-index.cache';
import { ExtractedEntity } from '../types/entity-extraction.types';

export class LongestMatchEntityMatcher implements IEntityMatcher {
  private readonly indexCache: EntityIndexCache;

  constructor(indexCache: EntityIndexCache) {
    this.indexCache = indexCache;
  }

  public matchSpans(rawQuery: string): ExtractedEntity[] {
    const query = (rawQuery || '').trim();
    if (!query) return [];

    const sortedTerms = this.indexCache.getSortedTerms();
    const occupiedSpans: Array<{ start: number; end: number }> = [];
    const extracted: ExtractedEntity[] = [];

    for (const { term, entity } of sortedTerms) {
      if (!term) continue;

      const escapedTerm = this.escapeRegExp(term);
      // Support word boundaries including special chars like '.' in 'node.js' or '/' in 'ci/cd'
      const regex = new RegExp(`(?:^|\\b|(?<=\\W))${escapedTerm}(?:$|\\b|(?=\\W))`, 'gi');

      let match: RegExpExecArray | null;
      while ((match = regex.exec(query)) !== null) {
        const start = match.index;
        const end = start + match[0].length;

        // Check if this span overlaps with an already matched longer entity
        if (this.isOverlapping(start, end, occupiedSpans)) {
          continue;
        }

        occupiedSpans.push({ start, end });

        extracted.push({
          entityId: entity.entityId,
          type: entity.type,
          name: entity.name,
          canonical: entity.canonical,
          matchedText: match[0],
          startIndex: start,
          endIndex: end,
          confidence: entity.confidence,
          attributes: { ...entity.attributes, category: entity.category },
        });
      }
    }

    // Sort extracted entities by startIndex ascending
    return extracted.sort((a, b) => a.startIndex - b.startIndex);
  }

  private isOverlapping(start: number, end: number, spans: Array<{ start: number; end: number }>): boolean {
    return spans.some((span) => Math.max(start, span.start) < Math.min(end, span.end));
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
