import { EngineResult } from '../../shared/interfaces/engine.interface';
import { ProcessingContext } from '../../normalization/types/processing-context.types';
import { DecisionResult } from '../decision-engine/decision.engine';

export interface ComposedResponse {
  message: string;
  sourceEngine: string;
  category: string;
  intent?: string;
  confidence: number;
  suggestions: Array<{ id: string; label: string; icon: string; prompt: string }>;
  metadata: Record<string, any>;
}

export class ResponseComposer {
  public composeResponse(
    decision: DecisionResult,
    engineResults: Record<string, EngineResult<any>>,
    context: ProcessingContext
  ): ComposedResponse {
    const { winningEngineResult, ruleMatched, shouldMergeGreetingIntent } = decision;

    let responseMessage = winningEngineResult.responseCandidate || 'Hello! Welcome to Mobiloitte.';
    let sourceEngine = winningEngineResult.engineName || 'Default Engine';
    let category = winningEngineResult.category || '';

    let sourceBadge = 'RAG';
    // CRITICAL: FastPath-Static must resolve to 'FastPath' badge, NOT 'RAG'
    if (sourceEngine === 'FastPath-Static' || sourceEngine.includes('FastPath-Static')) {
      sourceBadge = 'FastPath';
    } else if (sourceEngine.includes('FastPath') || sourceEngine === 'FastPath') {
      sourceBadge = 'FastPath';
    } else if (sourceEngine.includes('Fallback') || category === 'Fallback') {
      sourceBadge = 'Fallback';
    } else if (sourceEngine.includes('Gibberish') || category === 'Gibberish') {
      sourceBadge = 'Gibberish';
    } else if (
      sourceEngine.includes('Greeting') ||
      sourceEngine.includes('Acknowledgement') ||
      sourceEngine.includes('Thanks') ||
      sourceEngine.includes('Farewell') ||
      sourceEngine.includes('Help Engine') ||
      sourceEngine.includes('SmallTalk') ||
      sourceEngine.includes('Compliment') ||
      sourceEngine.includes('Motivation') ||
      category === 'Greeting' || category === 'Farewell' || category === 'Thanks' ||
      category === 'Help' || category === 'Acknowledgement' ||
      category.includes('greeting') || category.includes('farewell') ||
      category.includes('acknowledgement') || category.includes('thanks') ||
      category.includes('compliment') || category.includes('motivation') ||
      category.includes('smalltalk') || category.includes('small talk') ||
      category.includes('conversation continuation')
    ) {
      sourceBadge = 'Greeting';
    } else if (sourceEngine === 'DomainClassifier' || category === 'Out of Domain') {
      sourceBadge = 'DomainClassifier';
    }
    const intent = winningEngineResult.intent || category;
    const confidence = winningEngineResult.confidence || 0.0;
    // Single Winning Engine Architectural Principle:
    // Exactly ONE winning engine handles the request. No chained or merged responses.

    const rawQ = (context.originalQuery || context.cleanQuery || '').trim().toLowerCase();
    const isIdentityQuery = /^(are|is|who|what)\s+(you|u|kaira)\b/i.test(rawQ) || category === 'Bot Intro' || category === 'Capabilities';
    const isNonYesNoSource = sourceBadge === 'Fallback' || sourceBadge === 'Gibberish' || sourceBadge === 'DomainClassifier' || sourceBadge === 'Greeting';

    const isYesNo = /^(does|can|do|is|are|will|would|could)\b/i.test(rawQ) && !isIdentityQuery && !isNonYesNoSource;
    if (isYesNo && !responseMessage.toLowerCase().startsWith('yes') && !responseMessage.startsWith('#') && !responseMessage.startsWith('•')) {
      responseMessage = `Yes, ${responseMessage}`;
    } else if (!isYesNo) {
      responseMessage = responseMessage.replace(/^Yes,\s*/i, '').replace(/^Yes!\s*/i, '').replace(/^Yes\.\s*/i, '');
    }

    // Strip standalone document titles from single-intent responses
    responseMessage = responseMessage.replace(/^(Company Profile|Leadership & Executive Team|Office Locations|Core Services)\n+/i, '');

    const suggestions = this.generateSuggestions(intent || category);

    return {
      message: responseMessage.trim(),
      sourceEngine,
      category,
      intent,
      confidence,
      suggestions,
      metadata: {
        ruleMatched,
        cleanQuery: context.cleanQuery,
        sourceBadge,
        // Propagate provenance fields from winning engine result for ResponseBuilder audit
        knowledgeSource: winningEngineResult.metadata?.knowledgeSource,
        chunkIds: winningEngineResult.metadata?.chunkIds,
        documentIds: winningEngineResult.metadata?.documentIds,
        staticRecordSlug: winningEngineResult.metadata?.staticRecordSlug,
        provenance: winningEngineResult.metadata?.provenance,
        ...winningEngineResult.metadata,
      },
    };
  }


  private generateSuggestions(intentOrCategory?: string): Array<{ id: string; label: string; icon: string; prompt: string }> {
    const key = (intentOrCategory || '').toLowerCase();

    const convCats = [
      'standard', 'time based', 'indian', 'regional', 'hinglish', 'emoji', 'multiple greetings',
      'small talk', 'user status positive', 'user status negative', 'bot intro',
      'capabilities', 'compliments', 'motivation', 'jokes', 'conversation continuation',
      'thanks', 'farewell', 'help', 'appreciation', 'greeting engine', 'thanks engine',
      'farewell engine', 'help engine', 'acknowledgement engine', 'informal', 'business', 'formal',
      'apology', 'confirmation'
    ];

    if (key.includes('merged') || key.includes('extended') || key.includes('coexistence')) {
      // Keep suggestions for merged/coexistence query responses
    } else if (convCats.some(c => key === c || key.includes(c))) {
      return [];
    }

    if (
      key.includes('gibberish') ||
      key.includes('keyboard_mash') ||
      key.includes('random_characters') ||
      key.includes('emoji_spam') ||
      key.includes('repeated_characters') ||
      key.includes('symbol_noise') ||
      key.includes('low_char_entropy') ||
      key.includes('high_unknown_ratio') ||
      key.includes('mixed_script_anomaly')
    ) {
      return [];
    }

    if (key.includes('pricing') || key.includes('cost')) {
      return [
        { id: 'sug-1', label: 'Services & Tech', icon: '🚀', prompt: 'Tell me about Mobiloitte services' },
        { id: 'sug-2', label: 'Custom Quote', icon: '💰', prompt: 'How to get a custom pricing quote?' },
        { id: 'sug-3', label: 'Contact Sales', icon: '📞', prompt: 'How to contact sales?' },
      ];
    }

    if (key.includes('leadership') || key.includes('ceo') || key.includes('founder')) {
      return [
        { id: 'sug-1', label: 'Company Info', icon: '🏢', prompt: 'Tell me about Mobiloitte' },
        { id: 'sug-2', label: 'Office Locations', icon: '📍', prompt: 'Where is Mobiloitte located?' },
        { id: 'sug-3', label: 'Contact Leadership', icon: '👨‍💼', prompt: 'Contact leadership team' },
      ];
    }

    if (key.includes('services') || key.includes('technology') || key.includes('tech')) {
      return [
        { id: 'sug-1', label: 'Cloud & AI Solutions', icon: '🤖', prompt: 'Tell me about AI and Cloud services' },
        { id: 'sug-2', label: 'Mobile Apps', icon: '📱', prompt: 'Tell me about mobile app development' },
        { id: 'sug-3', label: 'Pricing Quote', icon: '💰', prompt: 'Pricing details' },
      ];
    }

    if (key.includes('location') || key.includes('office') || key.includes('address')) {
      return [
        { id: 'sug-1', label: 'Headquarters Address', icon: '📍', prompt: 'Where is New Delhi office?' },
        { id: 'sug-2', label: 'Global Offices', icon: '🌍', prompt: 'US regional office details' },
        { id: 'sug-3', label: 'Contact Support', icon: '📞', prompt: 'How to contact Mobiloitte?' },
      ];
    }

    return [
      { id: 'sug-1', label: 'Services & Tech', icon: '🚀', prompt: 'Tell me about Mobiloitte services' },
      { id: 'sug-2', label: 'Company Info', icon: '🏢', prompt: 'Tell me about Mobiloitte' },
      { id: 'sug-3', label: 'Leadership & CEO', icon: '👨‍💼', prompt: 'Who is the CEO of Mobiloitte?' },
      { id: 'sug-4', label: 'Office Locations', icon: '📍', prompt: 'Where is Mobiloitte located?' },
      { id: 'sug-5', label: 'Contact Support', icon: '📞', prompt: 'How to contact Mobiloitte?' },
    ];
  }
}
