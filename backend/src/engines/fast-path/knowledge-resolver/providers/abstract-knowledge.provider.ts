import { IKnowledgeProvider } from '../contracts/knowledge-provider.interface';
import { KnowledgeContext } from '../types/knowledge-context.types';
import { KnowledgeResult } from '../types/knowledge-result.types';

export abstract class AbstractKnowledgeProvider implements IKnowledgeProvider {
  public abstract readonly providerName: string;
  public abstract readonly priority: number;

  public abstract canHandle(context: KnowledgeContext): boolean;
  public abstract fetchKnowledge(context: KnowledgeContext): Promise<KnowledgeResult>;

  protected buildNotFoundResult(context: KnowledgeContext, latencyMs: number, reason: string): KnowledgeResult {
    return {
      status: 'NOT_FOUND',
      contextIntentId: context.intentId,
      records: [],
      primaryRecord: null,
      confidence: 0.0,
      providerName: this.providerName,
      resolutionLatencyMs: latencyMs,
      cacheHit: false,
      metadata: { reason },
    };
  }
}
