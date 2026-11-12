import { KnowledgeQueryResult } from '../types/query.types';

export interface QueryMetrics {
  totalQueriesExecuted: number;
  totalMatchesReturned: number;
  averageSearchTimeMs: number;
  lastSearchTimeMs: number;
}

export class QueryReport {
  public static generateReport(result: KnowledgeQueryResult): string {
    return `=== KNOWLEDGE QUERY ENGINE REPORT ===
Query: "${result.query}"
Normalized: "${result.normalizedQuery}"
Searched Domains: [${result.searchedDomains.join(', ')}]
Search Latency: ${result.searchTimeMs}ms
Matches Found: ${result.totalMatchesFound}
Best Match ID: ${result.bestMatch ? result.bestMatch.record.identity.id : 'NONE'}
Best Match Confidence: ${result.bestMatch ? result.bestMatch.confidence.toFixed(2) : 'N/A'}
====================================`;
  }
}
