import { KnowledgeContext } from '../types/knowledge-context.types';
import { KnowledgeResult } from '../types/knowledge-result.types';

export interface IKnowledgeResolver {
  resolveKnowledge(context: KnowledgeContext): Promise<KnowledgeResult>;
}
