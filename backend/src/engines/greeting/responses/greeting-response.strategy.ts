import {
  GreetingCategory,
  UserPersona,
  GreetingUnderstanding,
  DynamicResponseComposition,
} from '../types/greeting.types';
import { GreetingDictionary, greetingDictionary } from '../dictionaries/greeting.dictionary';
import { ProcessingContext } from '../../../normalization/types/processing-context.types';
import { GreetingResponseComposer, greetingResponseComposer } from '../composer/greeting.response.composer';

export interface ResponseStrategyResult {
  category: GreetingCategory;
  persona: UserPersona;
  responseTemplate: string;
  understanding?: GreetingUnderstanding;
  composition?: DynamicResponseComposition;
}

export class GreetingResponseStrategy {
  private readonly dict: GreetingDictionary;
  private readonly composer: GreetingResponseComposer;
  private readonly sessionHistoryMap: Map<string, string[]> = new Map();

  constructor(dict?: GreetingDictionary, composer?: GreetingResponseComposer) {
    this.dict = dict || greetingDictionary;
    this.composer = composer || greetingResponseComposer;
  }

  public determineStrategy(
    category: GreetingCategory,
    matchedGreeting?: string,
    persona: UserPersona = 'Professional',
    turnCount: number = 1,
    sessionId: string = 'anonymous',
    context?: ProcessingContext,
    understanding?: GreetingUnderstanding
  ): ResponseStrategyResult {
    let responseTemplate = 'Hello! 👋\n\nWelcome to Mobiloitte.\n\nHow may I assist you today?';
    let composition: DynamicResponseComposition | undefined;

    if (context && understanding) {
      composition = this.composer.compose(category, context, understanding, turnCount, sessionId);
      responseTemplate = composition.fullText;
    } else {
      const poolKey = this.resolvePoolKey(category, matchedGreeting, context, understanding);
      const pool = this.dict.responsesPool[poolKey] || this.dict.responsesPool.generic || [responseTemplate];
      const history = this.sessionHistoryMap.get(sessionId) || [];
      const availableCandidates = pool.filter((tpl) => !history.includes(tpl));
      const candidates = availableCandidates.length > 0 ? availableCandidates : pool;
      const index = (turnCount - 1) % candidates.length;
      responseTemplate = candidates[index] || pool[0];
    }

    // Removed forced heading logic to follow natural premium conversational tone

    this.trackHistory(sessionId, responseTemplate);

    return {
      category,
      persona,
      responseTemplate,
      understanding,
      composition,
    };
  }

  private resolvePoolKey(
    category: GreetingCategory,
    matchedGreeting?: string,
    context?: ProcessingContext,
    understanding?: GreetingUnderstanding
  ): string {
    switch (category) {
      case 'Small Talk':
        return 'smallTalk';
      case 'User Status Positive':
        return 'userStatusPositive';
      case 'User Status Negative':
        return 'userStatusNegative';
      case 'Bot Intro':
        return 'botIntro';
      case 'Capabilities':
        return 'capability';
      case 'Compliments':
        return 'compliments';
      case 'Motivation':
        return 'motivation';
      case 'Jokes':
        return 'jokes';
      case 'Conversation Continuation':
        return 'continuation';
      case 'Farewell':
        return 'farewell';
      case 'Thanks':
        return 'gratitude';
      case 'Apology':
        return 'apology';
      case 'Confirmation':
        return 'confirmation';
      case 'Appreciation':
        return 'compliments';
      case 'Help':
        return 'help';
      case 'Time Based': {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'goodmorning';
        if (hour >= 12 && hour < 17) return 'goodafternoon';
        return 'goodevening';
      }
      case 'Indian':
      case 'Hinglish':
        return 'namaste';
      case 'Business':
      case 'Greeting + Intent':
        return 'business';
      case 'Informal':
      case 'Emoji':
        return 'yo';
    }

    const term = (matchedGreeting || '').toLowerCase().trim();
    const orig = (context?.originalQuery || context?.cleanQuery || '').toLowerCase().trim();

    if (orig.includes('kaise ho') || orig.includes('kya haal')) return 'kaiseho';
    if (orig.includes('aur bhai') || orig.includes('aur dost')) return 'aurbhai';
    if (understanding?.audience === 'Sir' || understanding?.audience === 'CEO' || orig.includes('sir')) return 'helloSir';
    if (understanding?.energy === 'High' && (term.includes('hi') || orig.includes('hi'))) return 'hiHighEnergy';

    if (term === 'ram ram' || orig.includes('ram ram') || orig.includes('ramram')) return 'ramram';
    if (orig.includes('namaste') || orig.includes('namaskar')) return 'namaste';
    if (orig.includes('sat sri akal')) return 'namaste';
    if (orig.includes('vanakkam')) return 'namaste';
    if (orig.includes('kem cho')) return 'namaste';
    if (orig.includes('salaam') || orig.includes('salam')) return 'namaste';

    if (context?.emojiMetadata?.emojis?.includes('😂') || context?.emojiMetadata?.emojis?.includes('😄')) return 'emojiLaugh';
    if (context?.emojiMetadata?.emojis?.includes('🙏')) return 'emojiHands';
    if (context?.emojiMetadata?.emojis?.includes('👋')) return 'emojiHand';

    if (orig.includes('good night') || orig.includes('goodnight') || term === 'gn' || term === 'good night') return 'goodnight';
    if (orig.includes('good morning') || orig.includes('goodmorning') || term === 'gm' || term === 'good morning') return 'goodmorning';
    if (orig.includes('good afternoon') || orig.includes('goodafternoon') || term === 'ga' || term === 'good afternoon') return 'goodafternoon';
    if (orig.includes('good evening') || orig.includes('goodevening') || term === 'ge' || term === 'good evening') return 'goodevening';

    if (term === 'hi' || term === 'hii' || term === 'hiii') return 'hi';
    if (term === 'hello' || term === 'helo' || term === 'hlo') return 'hello';
    if (term === 'hey' || term === 'heyy' || term === 'heya') return 'hey';
    if (term === 'yo' || term === 'sup' || term === 'wassup' || term === 'yoo') return 'yo';

    return 'generic';
  }

  private trackHistory(sessionId: string, template: string): void {
    let history = this.sessionHistoryMap.get(sessionId) || [];
    history.push(template);
    if (history.length > 5) {
      history.shift();
    }
    this.sessionHistoryMap.set(sessionId, history);
  }

  public resetHistory(sessionId?: string): void {
    if (sessionId) {
      this.sessionHistoryMap.delete(sessionId);
    } else {
      this.sessionHistoryMap.clear();
    }
  }
}
