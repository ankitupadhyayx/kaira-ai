import { KnowledgeCacheService } from '../../cache/knowledge-cache.service';
import { BaseKnowledgeRecord } from '../../schemas/base/base-knowledge.schema';
import { KnowledgeQueryMatch } from '../types/query.types';

export class ExactMatcher {
  public match(normalizedQuery: string, cache: KnowledgeCacheService): KnowledgeQueryMatch | null {
    const recordById = cache.getRecordById(normalizedQuery.toUpperCase()) || cache.getRecordById(normalizedQuery);
    if (recordById) {
      return this.createMatch(recordById, 1.0, 'EXACT_MATCH');
    }

    const recordBySlug = cache.getRecordBySlug(normalizedQuery.toLowerCase());
    if (recordBySlug) {
      return this.createMatch(recordBySlug, 1.0, 'EXACT_MATCH');
    }

    return null;
  }

  private createMatch(record: BaseKnowledgeRecord, confidence: number, matchType: any): KnowledgeQueryMatch {
    return {
      record,
      domain: record.identity.domain,
      confidence,
      matchType,
      matchedKeywords: [],
      matchedAliases: [record.identity.slug],
      relatedRecords: [],
      rankingScore: confidence * 100,
    };
  }
}
