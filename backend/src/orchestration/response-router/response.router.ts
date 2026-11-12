import { EngineResult } from '../../shared/interfaces/engine.interface';
import { ApiResponse } from '../../shared/types/common.types';
import { ProcessingContext } from '../../normalization/types/processing-context.types';

export interface MergedCompositionInput {
  context: ProcessingContext;
  greetingResult?: EngineResult<any>;
  fastPathResult?: EngineResult<any>;
  gibberishResult?: EngineResult<any>;
  winningEngineResult: EngineResult<any>;
  ruleMatched: string;
  totalLatencyMs: number;
  correlationId?: string;
}

export class ResponseRouter {
  public composeResponse(input: MergedCompositionInput): ApiResponse {
    const { greetingResult, fastPathResult, winningEngineResult, ruleMatched, totalLatencyMs, correlationId = 'none' } = input;

    let responseMessage = winningEngineResult.responseCandidate || 'Hello! 👋 How can I assist you today?';
    let sourceName = winningEngineResult.engineName || 'Default Engine';
    let categoryName = winningEngineResult.category || '';

    // Specialized Merged Composition for Greeting + Intent (e.g., "Hi, what services do you provide?")
    if (
      greetingResult?.handled &&
      fastPathResult?.handled &&
      (ruleMatched === 'RULE_GREETING_TECH_COEXISTENCE' || ruleMatched === 'RULE_GREETING_INTENT_MERGED' || fastPathResult.responseCandidate)
    ) {
      const greetingText = greetingResult.payload?.recommendedResponseStrategy?.responseTemplate || greetingResult.responseCandidate || 'Hello! 👋';
      const answerText = fastPathResult.responseCandidate;

      if (answerText) {
        responseMessage = `${greetingText}\n\n${answerText}`;
        sourceName = 'GreetingEngine + FastPathEngine';
        categoryName = 'Greeting + Intent Merged';
      }
    }

    // Dynamic Intent-Driven Suggestions Generation
    const suggestions = this.getIntentSuggestions(fastPathResult?.intent || winningEngineResult.intent || categoryName);

    const categoryLabel = categoryName ? ` (${categoryName})` : '';
    const debugBadge = `Source: ${sourceName}${categoryLabel}`;

    return {
      success: true,
      data: {
        message: responseMessage.trim(),
        suggestions,
        debugBadge,
        debugSource: sourceName,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        correlationId,
        executionTimeMs: Math.round(totalLatencyMs * 100) / 100,
      },
    };
  }

  private getIntentSuggestions(intentOrCategory?: string): Array<{ id: string; label: string; icon: string; prompt: string }> {
    const key = (intentOrCategory || '').toLowerCase();

    if (key.includes('pricing')) {
      return [
        { id: 'sug-1', label: 'Services & Tech', icon: '🚀', prompt: 'Tell me about Mobiloitte services' },
        { id: 'sug-2', label: 'Custom Quote', icon: '💰', prompt: 'How to get a custom pricing quote?' },
        { id: 'sug-3', label: 'Contact Sales', icon: '📞', prompt: 'How to contact sales?' },
      ];
    }

    if (key.includes('leadership') || key.includes('ceo')) {
      return [
        { id: 'sug-1', label: 'Company Info', icon: '🏢', prompt: 'Tell me about Mobiloitte' },
        { id: 'sug-2', label: 'Office Locations', icon: '📍', prompt: 'Where is Mobiloitte located?' },
        { id: 'sug-3', label: 'Contact CEO Office', icon: '👨‍💼', prompt: 'Contact leadership team' },
      ];
    }

    if (key.includes('services') || key.includes('technology')) {
      return [
        { id: 'sug-1', label: 'Cloud & AI', icon: '🤖', prompt: 'Tell me about AI and Cloud services' },
        { id: 'sug-2', label: 'Mobile Apps', icon: '📱', prompt: 'Tell me about mobile app development' },
        { id: 'sug-3', label: 'Pricing Quote', icon: '💰', prompt: 'Pricing details' },
      ];
    }

    if (key.includes('location') || key.includes('office')) {
      return [
        { id: 'sug-1', label: 'Headquarters Address', icon: '📍', prompt: 'Where is New Delhi office?' },
        { id: 'sug-2', label: 'US Office', icon: '🇺🇸', prompt: 'US regional office details' },
        { id: 'sug-3', label: 'Contact Support', icon: '📞', prompt: 'How to contact Mobiloitte?' },
      ];
    }

    // Default Fallback Suggestions
    return [
      { id: 'sug-1', label: 'Services & Tech', icon: '🚀', prompt: 'Tell me about Mobiloitte services' },
      { id: 'sug-2', label: 'Company Info', icon: '🏢', prompt: 'Tell me about Mobiloitte' },
      { id: 'sug-3', label: 'Leadership & CEO', icon: '👨‍💼', prompt: 'Who is the CEO of Mobiloitte?' },
      { id: 'sug-4', label: 'Office Locations', icon: '📍', prompt: 'Where is Mobiloitte located?' },
      { id: 'sug-5', label: 'Contact Support', icon: '📞', prompt: 'How to contact Mobiloitte?' },
    ];
  }
}
