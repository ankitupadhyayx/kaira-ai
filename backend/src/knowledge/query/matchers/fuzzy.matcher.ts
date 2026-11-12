import { KnowledgeCacheService } from '../../cache/knowledge-cache.service';
import { BaseKnowledgeRecord } from '../../schemas/base/base-knowledge.schema';
import { KnowledgeQueryMatch } from '../types/query.types';

export class FuzzyMatcher {
  public match(normalizedQuery: string, cache: KnowledgeCacheService): KnowledgeQueryMatch[] {
    const matches: KnowledgeQueryMatch[] = [];
    const allRecords = cache.getAllRecords();
    const queryNorm = normalizedQuery.toLowerCase();

    for (const record of allRecords) {
      const titleNorm = record.content.title.toLowerCase();
      if (titleNorm.includes(queryNorm) || (queryNorm.length > 3 && titleNorm.length > 3 && this.levenshtein(queryNorm, titleNorm) <= 2)) {
        matches.push({
          record,
          domain: record.identity.domain,
          confidence: 0.60,
          matchType: 'FUZZY_MATCH',
          matchedKeywords: [queryNorm],
          matchedAliases: [],
          relatedRecords: [],
          rankingScore: 60,
        });
      }
    }

    return matches;
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1),
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}
