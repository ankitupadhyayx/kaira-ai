import { ProcessingContext } from '../../normalization/types/processing-context.types';

export interface StructuredFallbackPayload {
  status: 'UNHANDLED_FALLBACK';
  query: string;
  normalizedQuery: string;
  reason: 'NO_ENGINE_MATCH' | 'LOW_CONFIDENCE' | 'OUT_OF_SCOPE';
  suggestedPrompts: Array<{ label: string; prompt: string }>;
  timestamp: string;
}

export class FallbackRouter {
  public createFallbackResponse(context: ProcessingContext): StructuredFallbackPayload {
    const rawQuery = context.originalQuery || '';
    const cleanQuery = context.cleanQuery || rawQuery;

    return {
      status: 'UNHANDLED_FALLBACK',
      query: rawQuery,
      normalizedQuery: cleanQuery,
      reason: 'NO_ENGINE_MATCH',
      suggestedPrompts: [
        { label: 'Services & Tech', prompt: 'Tell me about Mobiloitte services' },
        { label: 'Company Info', prompt: 'Tell me about Mobiloitte' },
        { label: 'Office Locations', prompt: 'Where is Mobiloitte located?' },
        { label: 'Contact Support', prompt: 'How to contact Mobiloitte?' },
      ],
      timestamp: new Date().toISOString(),
    };
  }
}
