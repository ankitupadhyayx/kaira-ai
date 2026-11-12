import { KnowledgeQueryResult } from '../query/types/query.types';
import { FormattedKnowledgeResponse, ChatResponse } from './types/formatter.types';
import { TemplateRegistry } from './templates/template.registry';

export class ResponseFormatter {
  private readonly templateRegistry: TemplateRegistry;

  constructor() {
    this.templateRegistry = TemplateRegistry.getInstance();
  }

  public formatQueryResult(queryResult: KnowledgeQueryResult): FormattedKnowledgeResponse {
    const startTime = Date.now();
    const query = queryResult.query || '';

    if (!queryResult.bestMatch) {
      const fallbackTemplate = this.templateRegistry.resolveTemplate(undefined, query);
      const chatResp = fallbackTemplate.render({} as any, query, 'NO_MATCH', 0.0);
      return this.toFormattedResponse(chatResp, startTime);
    }

    const match = queryResult.bestMatch;
    const record = match.record;
    const template = this.templateRegistry.resolveTemplate(record as any, query);

    const chatResponse = template.render(
      record as any,
      query,
      match.matchType || 'EXACT_MATCH',
      match.confidence || 1.0
    );

    return this.toFormattedResponse(chatResponse, startTime);
  }

  public formatResponse(record?: any, query?: string): ChatResponse {
    const template = this.templateRegistry.resolveTemplate(record, query || '');
    return template.render(record, query || '');
  }

  private toFormattedResponse(chatResponse: ChatResponse, startTime: number): FormattedKnowledgeResponse {
    return {
      ...chatResponse,
      mainAnswer: chatResponse.body || chatResponse.summary,
      suggestedFollowups: chatResponse.followUpQuestions || [],
      metadataText: chatResponse.metadata ? JSON.stringify(chatResponse.metadata) : '',
      formattingTimeMs: Date.now() - startTime,
    };
  }
}
