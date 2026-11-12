import { EngineResult } from '../../shared/interfaces/engine.interface';
import { ProcessingContext } from '../../normalization/types/processing-context.types';
import { GibberishResponseGenerator } from '../../engines/gibberish/responses/gibberish.response.generator';
import { GibberishReasonCode } from '../../engines/gibberish/types/gibberish.types';
import { PipelineOrchestrator } from '../../normalization/pipeline-orchestrator/pipeline.orchestrator';
import { GibberishEngine } from '../../engines/gibberish/services/gibberish.engine';
import { TokenValidator } from '../../normalization/utils/token-validator.utils';

export interface DecisionResult {
  winningEngineResult: EngineResult<any>;
  ruleMatched: string;
  shouldMergeGreetingIntent?: boolean;
}

export class DecisionEngine {
  public static readonly CONVERSATIONAL_ACKS = /^(ok|okay|yes|no|hmm|hmmm|bro|bhai|cool|great|nice|awesome|perfect|done|lol|haha|sure|yep|yeah|got it)$/i;
  public static readonly OUT_OF_SCOPE_WORDS = /\b(pizza|ipl|coffee|tea|school|college|car|bike|burger|movie|music|football|cricket|real estate|bhk|2 bhk|3 bhk|fashion|hotel|restaurant|weather|politics|stocks|gaming|pets|shopping|travel|food|game|sports|table of \d+|multiplication table|solve math|math problem|riddle|programming puzzle|joke|jokes|write a poem|translate to|capital of|who is president|who is prime minister|photosynthesis)\b/i;

  constructor() {}

  public evaluateDecision(
    greetingResult: EngineResult<any>,
    gibberishResult: EngineResult<any>,
    fastPathResult?: EngineResult<any>,
    knowledgeResultOrContext?: EngineResult<any> | ProcessingContext,
    contextParam?: ProcessingContext
  ): DecisionResult {
    let knowledgeResult: EngineResult<any> | undefined = undefined;
    let context: ProcessingContext | undefined = undefined;

    if (knowledgeResultOrContext && 'normalizedTokens' in (knowledgeResultOrContext as any)) {
      context = knowledgeResultOrContext as ProcessingContext;
    } else {
      knowledgeResult = knowledgeResultOrContext as EngineResult<any>;
      context = contextParam;
    }

    const cleanQuery = (context?.cleanQuery || context?.originalQuery || '').trim().toLowerCase();
    const rawQueryText = (context?.originalQuery || context?.cleanQuery || '').trim().toLowerCase();
    const isUnapprovedShort = rawQueryText.length <= 2 && TokenValidator.isUnapprovedShortToken(rawQueryText);

    // Effective Knowledge Engine Result
    const effectiveKnowledgeResult = knowledgeResult || (fastPathResult?.engineName === 'KnowledgeEngine' ? fastPathResult : undefined);
    const effectiveFastPathResult = fastPathResult?.engineName === 'FastPathEngine' ? fastPathResult : undefined;

    // 0. High-Confidence FastPath Match Priority (FastPath direct match over Greeting Bot Intro & Knowledge RAG)
    if (effectiveFastPathResult && effectiveFastPathResult.handled && effectiveFastPathResult.confidence >= 0.98 && !isUnapprovedShort) {
      return {
        winningEngineResult: {
          ...effectiveFastPathResult,
          engineName: 'FastPath Engine',
        },
        ruleMatched: 'RULE_FASTPATH_MATCH',
      };
    }

    // 1. Conversation Engine Priority (Handles all standalone conversation intents)
    const conversationCategories = new Set([
      'Standard', 'Time Based', 'Indian', 'Regional', 'Hinglish', 'Emoji', 'Multiple Greetings',
      'Small Talk', 'User Status Positive', 'User Status Negative', 'Bot Intro',
      'Capabilities', 'Compliments', 'Motivation', 'Jokes', 'Conversation Continuation',
      'Thanks', 'Farewell', 'Help', 'Appreciation', 'Informal', 'Business', 'Formal',
      'Apology', 'Confirmation', 'Confusion'
    ]);

    if (
      greetingResult &&
      greetingResult.handled &&
      greetingResult.category &&
      !greetingResult.payload?.hasBusinessQuery &&
      greetingResult.category !== 'Greeting + Intent' &&
      conversationCategories.has(greetingResult.category)
    ) {
      let engineName = 'Greeting Engine';
      if (greetingResult.category === 'Thanks') engineName = 'Thanks Engine';
      else if (greetingResult.category === 'Farewell') engineName = 'Farewell Engine';
      else if (['Help', 'Capabilities'].includes(greetingResult.category)) engineName = 'Help Engine';
      else if (['Appreciation', 'Compliments', 'Conversation Continuation'].includes(greetingResult.category)) engineName = 'Acknowledgement Engine';

      return {
        winningEngineResult: {
          ...greetingResult,
          engineName,
          handled: true,
          confidence: greetingResult.confidence || 1.0,
          responseCandidate: greetingResult.responseCandidate,
        },
        ruleMatched: 'RULE_CONVERSATION_PRIORITY',
      };
    }

    // 2. Fallback Thanks check (when cleanQuery is matched but greetingResult is not handled)
    if (!greetingResult?.handled && /^(thanks|thank you|thx|thankyou|many thanks|thanks a lot|thank you so much)$/i.test(cleanQuery)) {
      return {
        winningEngineResult: {
          engineName: 'Thanks Engine',
          handled: true,
          confidence: 0.95,
          category: 'Thanks',
          responseCandidate: `You're very welcome! Let me know if you have any questions about Mobiloitte's software development services, pricing, or technology stack.`,
          metadata: {},
        },
        ruleMatched: 'RULE_THANKS_PRIORITY',
      };
    }

    // 3. Fallback Help check (when cleanQuery is matched but greetingResult is not handled)
    if (!greetingResult?.handled && /^(help|capabilities|what can you do|menu|commands)$/i.test(cleanQuery)) {
      return {
        winningEngineResult: {
          engineName: 'Help Engine',
          handled: true,
          confidence: 0.95,
          category: 'Help',
          responseCandidate: `I am Kaira, Mobiloitte's Enterprise Assistant! 🚀\n\nI can help you explore:\n• Custom Software & Mobile App Development\n• AI, ML & Generative AI Solutions\n• Cloud Architecture & DevOps\n• Blockchain & Web3 Engineering\n• Office Locations & Sales Contact Details\n\nWhat would you like to know today?`,
          metadata: {},
        },
        ruleMatched: 'RULE_HELP_PRIORITY',
      };
    }

    // 4. Fallback Acknowledgement check
    if (!greetingResult?.handled && DecisionEngine.CONVERSATIONAL_ACKS.test(cleanQuery)) {
      return {
        winningEngineResult: {
          engineName: 'Acknowledgement Engine',
          handled: true,
          confidence: 0.95,
          category: 'Acknowledgement',
          responseCandidate: `Got it! Let me know if you have any questions about Mobiloitte's software development services, pricing, or technology stack.`,
          metadata: {},
        },
        ruleMatched: 'RULE_ACKNOWLEDGEMENT_PRIORITY',
      };
    }

    // 6. Mixed Greeting + Intent Coexistence Merging
    const activeSecondaryResult = (effectiveKnowledgeResult && effectiveKnowledgeResult.handled && effectiveKnowledgeResult.confidence >= 0.50)
      ? effectiveKnowledgeResult
      : (effectiveFastPathResult && effectiveFastPathResult.handled && effectiveFastPathResult.confidence >= 0.50 ? effectiveFastPathResult : undefined);

    if (
      greetingResult &&
      greetingResult.handled &&
      (greetingResult.category === 'Greeting + Intent' || greetingResult.payload?.hasBusinessQuery) &&
      activeSecondaryResult
    ) {
      return {
        winningEngineResult: activeSecondaryResult,
        ruleMatched: 'RULE_GREETING_INTENT_MERGED',
        shouldMergeGreetingIntent: true,
      };
    }

    // 6.5 Resolve Greeting + Intent fallback when no active secondary result is matched
    if (
      greetingResult &&
      greetingResult.handled &&
      (greetingResult.category === 'Greeting + Intent' || greetingResult.payload?.hasBusinessQuery) &&
      !activeSecondaryResult
    ) {
      const primaryCat = greetingResult.payload?.categories?.[0] || 'Standard';
      if (primaryCat === 'Thanks') {
        const thanksText = greetingResult.responseCandidate || `You're very welcome! Let me know if you have any questions about Mobiloitte's software development services, pricing, or technology stack.`;
        return {
          winningEngineResult: {
            ...greetingResult,
            engineName: 'Thanks Engine',
            handled: true,
            category: 'Thanks',
            responseCandidate: thanksText,
          },
          ruleMatched: 'RULE_THANKS_FALLBACK_WINNER',
        };
      }
      if (primaryCat === 'Farewell') {
        return {
          winningEngineResult: {
            ...greetingResult,
            engineName: 'Farewell Engine',
            handled: true,
            category: 'Farewell',
          },
          ruleMatched: 'RULE_FAREWELL_FALLBACK_WINNER',
        };
      }
      if (primaryCat === 'Help') {
        const helpText = greetingResult.responseCandidate || `I am Kaira, Mobiloitte's Enterprise Assistant! 🚀\n\nI can help you explore:\n• Custom Software & Mobile App Development\n• AI, ML & Generative AI Solutions\n• Cloud Architecture & DevOps\n• Blockchain & Web3 Engineering\n• Office Locations & Sales Contact Details\n\nWhat would you like to know today?`;
        return {
          winningEngineResult: {
            ...greetingResult,
            engineName: 'Help Engine',
            handled: true,
            category: 'Help',
            responseCandidate: helpText,
          },
          ruleMatched: 'RULE_HELP_FALLBACK_WINNER',
        };
      }
      // Standard greeting fallback
      return {
        winningEngineResult: {
          ...greetingResult,
          engineName: 'Greeting Engine',
          handled: true,
          category: primaryCat,
        },
        ruleMatched: 'RULE_GREETING_FALLBACK_WINNER',
      };
    }

    // 7. Out of Scope Domain Check
    const fpMatchedTerm = gibberishResult?.payload?.falsePositiveCheck?.matchedTerm;
    if (
      fpMatchedTerm === 'OUT_OF_SCOPE_DOMAIN' ||
      gibberishResult?.payload?.falsePositiveCheck?.reason === 'OUT_OF_SCOPE_DOMAIN' ||
      gibberishResult?.category === 'Out of Scope Domain' ||
      DecisionEngine.OUT_OF_SCOPE_WORDS.test(cleanQuery)
    ) {
      return {
        winningEngineResult: {
          engineName: 'Fallback Engine',
          handled: true,
          confidence: 0.90,
          category: 'Out of Scope Domain',
          responseCandidate: GibberishResponseGenerator.generateResponse('OUT_OF_DOMAIN_FALLBACK'),
          metadata: { rawQuery: context?.originalQuery },
        },
        ruleMatched: 'RULE_OUT_OF_SCOPE_DOMAIN',
      };
    }

    // 8. Knowledge & RAG Engine Priority
    if (effectiveKnowledgeResult && effectiveKnowledgeResult.handled && !isUnapprovedShort) {
      const winningName = effectiveKnowledgeResult.engineName || (effectiveKnowledgeResult.metadata?.source as string) || 'RAG';
      return {
        winningEngineResult: {
          ...effectiveKnowledgeResult,
          engineName: winningName,
        },
        ruleMatched: winningName === 'Fallback' ? 'RULE_ENTERPRISE_FALLBACK' : 'RULE_KNOWLEDGE_MATCH',
      };
    }

    // 9. FastPath Engine Priority (Rule 4: c >= 0.80 and not unapproved short input)
    if (effectiveFastPathResult && effectiveFastPathResult.handled && effectiveFastPathResult.confidence >= 0.80 && !isUnapprovedShort) {
      return {
        winningEngineResult: {
          ...effectiveFastPathResult,
          engineName: 'FastPath Engine',
        },
        ruleMatched: 'RULE_FASTPATH_MATCH',
      };
    }

    // 10. Whitelisted Term Check
    if (gibberishResult?.payload?.falsePositiveCheck?.reason === 'WHITE_LISTED_TERM') {
      const matchedTerm = gibberishResult.payload.falsePositiveCheck.matchedTerm || cleanQuery;
      const isCompanyTerm = /^(mobiloitte|company|about company|abt company|jagdish harsh)$/i.test(matchedTerm.trim());
      if (isCompanyTerm) {
        return {
          winningEngineResult: {
            engineName: 'FastPath Engine',
            handled: true,
            confidence: 0.95,
            category: 'Company Profile',
            responseCandidate: `Mobiloitte is an AI-first software engineering company established in 2004.\n• 20+ years of experience & 500+ software engineers\n• Global offices in India (HQ), USA, UK, UAE, and Singapore\n• Website: [www.mobiloitte.com](https://www.mobiloitte.com)`,
            metadata: { matchedTerm },
          },
          ruleMatched: 'RULE_COMPANY_PLACEHOLDER',
        };
      }
      const category = 'Technology Knowledge';
      return {
        winningEngineResult: {
          engineName: 'Knowledge Engine',
          handled: true,
          confidence: 0.80,
          category,
          responseCandidate: `Mobiloitte provides specialized software engineering and technology consulting for **${matchedTerm}**. For full details, custom proposals, or technical architecture design, please email sales@mobiloitte.com or call +91-9999525501.`,
          metadata: { matchedTerm },
        },
        ruleMatched: isCompanyTerm ? 'RULE_COMPANY_PLACEHOLDER' : 'RULE_TECH_PLACEHOLDER',
      };
    }

    // 11. Gibberish Engine Priority
    if (gibberishResult && gibberishResult.handled && gibberishResult.confidence >= 0.60) {
      const reasonCode = (gibberishResult.category as GibberishReasonCode) || 'RANDOM_CHARACTERS';
      return {
        winningEngineResult: {
          ...gibberishResult,
          engineName: 'Gibberish Engine',
          responseCandidate: gibberishResult.responseCandidate || GibberishResponseGenerator.generateResponse(reasonCode),
        },
        ruleMatched: 'RULE_GIBBERISH_MATCH',
      };
    }

    // 12. Fallback / Unknown Engine
    return {
      winningEngineResult: {
        engineName: 'Fallback Engine',
        handled: true,
        confidence: 0.50,
        category: 'Unknown',
        responseCandidate: GibberishResponseGenerator.generateResponse('OUT_OF_DOMAIN_FALLBACK'),
        metadata: { cleanQuery },
      },
      ruleMatched: 'RULE_NO_MATCH_FALLBACK',
    };
  }
}
