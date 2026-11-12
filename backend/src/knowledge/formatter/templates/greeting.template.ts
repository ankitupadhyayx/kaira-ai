import { BaseTemplate } from './base.template';
import { ResponseType, ChatResponse } from '../types/formatter.types';
import { BaseKnowledgeRecord } from '../../schemas/base/base-knowledge.schema';

export class GreetingTemplate extends BaseTemplate {
  public readonly type: ResponseType = 'Greeting';

  public render(
    record: BaseKnowledgeRecord,
    query: string,
    matchType: string = 'GREETING',
    confidence: number = 1.0
  ): ChatResponse {
    const rawQuery = query.trim().toLowerCase();
    const isFarewell = /^(bye|goodbye|see ya|tata|farewell)$/i.test(rawQuery);
    const isAck = /^(thanks|thank you|thx|ok|okay|cool|great|awesome|nice)$/i.test(rawQuery);

    const type: ResponseType = isFarewell ? 'Farewell' : isAck ? 'Acknowledgement' : 'Greeting';
    const title = isFarewell ? 'Goodbye from Mobiloitte 👋' : isAck ? 'Thank You!' : 'Welcome to Mobiloitte 👋';
    const summary = isFarewell
      ? 'Thank you for reaching out to Mobiloitte enterprise support. Have a wonderful day!'
      : isAck
      ? "Glad we could assist you! Let us know if you need anything else regarding Mobiloitte's software services."
      : 'Hello! I am Kaira, your Mobiloitte enterprise assistant.';

    const highlights = isFarewell
      ? [
          'Available 24/7 for mobile, web, AI, and cloud queries',
          'Contact sales@mobiloitte.com or call +91-9999525501 for projects',
        ]
      : isAck
      ? [
          'Explore custom software development services',
          'Check out AI, Blockchain, and Cloud infrastructure practices',
        ]
      : [
          'Enterprise Software Development & Digital Transformation',
          'Artificial Intelligence, Machine Learning & GenAI',
          'Blockchain, Smart Contracts & Web3 Engineering',
          'Cloud Architecture, DevOps & Mobile Applications',
        ];

    const followUpQuestions = isFarewell
      ? ['Would you like to leave project details for a call-back?']
      : [
          'What software development services does Mobiloitte offer?',
          'Who is the CEO of Mobiloitte?',
          'Where are Mobiloitte office locations?',
        ];

    const markdownBlocks: string[] = [
      `# ${title}`,
      `_${summary}_`,
      `### Highlights\n` + highlights.map((h) => `• ${h}`).join('\n'),
      `### Suggested Questions\n` + followUpQuestions.map((q) => `• ${q}`).join('\n'),
    ];

    return {
      type,
      depth: 1,
      title,
      summary,
      body: summary,
      highlights,
      followUpQuestions,
      sections: [],
      relatedTopics: ['Company', 'Services', 'Careers', 'Leadership'],
      references: [],
      metadata: {
        domain: 'greeting',
        confidence,
        matchType,
      },
      markdownText: markdownBlocks.join('\n\n'),
    };
  }
}
