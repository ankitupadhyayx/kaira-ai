import { EnterpriseSearchResult } from '../types/search.types';

export class SearchReport {
  public static generateReport(result: EnterpriseSearchResult): string {
    return `=== ENTERPRISE SEARCH REPORT ===
Query: "${result.query}"
Normalized: "${result.normalizedQuery}"
Terminal Stage: ${result.stageExecuted}
Search Latency: ${result.searchTimeMs}ms
Candidates Evaluated: ${result.totalCandidatesEvaluated}
Best Match ID: ${result.bestMatch ? result.bestMatch.record.identity.id : 'NONE'}
Best Match Confidence: ${result.bestMatch ? result.bestMatch.confidence.toFixed(2) : 'N/A'}
================================`;
  }
}
