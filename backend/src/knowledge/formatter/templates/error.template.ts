import { BaseTemplate } from './base.template';
import { ResponseType, ChatResponse } from '../types/formatter.types';
import { BaseKnowledgeRecord } from '../../schemas/base/base-knowledge.schema';

export class ErrorTemplate extends BaseTemplate {
  public readonly type: ResponseType = 'Error';

  public render(
    record: BaseKnowledgeRecord,
    query: string,
    matchType: string = 'ERROR',
    confidence: number = 0.0
  ): ChatResponse {
    const title = 'Unable to Process Query';
    const summary = `We encountered an issue processing the query "${query}".`;
    const followUpQuestions = [
      'Would you like to search our core services?',
      'Would you like to contact Mobiloitte support?',
    ];

    const markdownText = `# ${title}\n\n_${summary}_\n\n### Suggested Questions\n` + followUpQuestions.map((q) => `• ${q}`).join('\n');

    return {
      type: this.type,
      depth: 1,
      title,
      summary,
      body: summary,
      highlights: [],
      followUpQuestions,
      sections: [],
      relatedTopics: ['Support', 'Help'],
      references: [],
      metadata: {
        domain: 'error',
        confidence,
        matchType,
      },
      markdownText,
    };
  }
}
