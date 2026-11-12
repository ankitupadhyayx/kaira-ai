export type KnowledgeResolutionStatus = 'RESOLVED' | 'CACHE_HIT' | 'NOT_FOUND' | 'ERROR';

export interface KnowledgeRecord {
  id: string;
  title: string;
  content: string;
  format: 'text' | 'markdown' | 'json' | 'html';
  confidence: number;
  sourceProvider: string;
  attributes: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface KnowledgeResult {
  status: KnowledgeResolutionStatus;
  contextIntentId: string;
  records: KnowledgeRecord[];
  primaryRecord: KnowledgeRecord | null;
  confidence: number;
  providerName: string;
  resolutionLatencyMs: number;
  cacheHit: boolean;
  metadata: Record<string, unknown>;
}
