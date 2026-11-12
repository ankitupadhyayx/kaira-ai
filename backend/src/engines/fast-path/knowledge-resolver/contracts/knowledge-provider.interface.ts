import { KnowledgeContext } from '../types/knowledge-context.types';
import { KnowledgeResult } from '../types/knowledge-result.types';

export interface IKnowledgeProvider {
  readonly providerName: string;
  readonly priority: number;
  canHandle(context: KnowledgeContext): boolean;
  fetchKnowledge(context: KnowledgeContext): Promise<KnowledgeResult>;
}
