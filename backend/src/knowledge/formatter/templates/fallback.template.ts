import { BaseTemplate } from './base.template';
import { ResponseType, ChatResponse } from '../types/formatter.types';
import { BaseKnowledgeRecord } from '../../schemas/base/base-knowledge.schema';

export class FallbackTemplate extends BaseTemplate {
  public readonly type: ResponseType = 'Fallback';

  public render(
    record: BaseKnowledgeRecord,
    query: string,
    matchType: string = 'NO_MATCH',
    confidence: number = 0.0
  ): ChatResponse {
    const title = 'Mobiloitte Enterprise Guidance';
    const summary = `I couldn't find relevant information about this topic in the current enterprise knowledge base. If this document or policy exists internally, it may not have been uploaded yet. Please contact your department administrator or explore the options below.`;
    const highlights = [
      'Email Sales: sales@mobiloitte.com',
      'Phone Contact: +91-9999525501',
      'Head Office: Pocket D, Okhla Phase I, D-115, New Delhi, Delhi 110020',
    ];
    const followUpQuestions = [
      'What services does Mobiloitte offer?',
      'Who is the CEO of Mobiloitte?',
      'Where are Mobiloitte office locations?',
    ];

    const markdownText = `# ${title}\n\n_${summary}_\n\n### Contact Details\n` + highlights.map((h) => `• ${h}`).join('\n') + `\n\n### Suggested Questions\n` + followUpQuestions.map((q) => `• ${q}`).join('\n');

    return {
      type: this.type,
      depth: 1,
      title,
      summary,
      body: summary,
      highlights,
      followUpQuestions,
      sections: [],
      relatedTopics: ['Services', 'Leadership', 'Contact'],
      references: ['[Mobiloitte Official Website](https://www.mobiloitte.com)'],
      metadata: {
        domain: 'fallback',
        confidence,
        matchType,
      },
      markdownText,
    };
  }
}
