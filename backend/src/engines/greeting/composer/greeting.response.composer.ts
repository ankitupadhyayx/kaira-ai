import {
  GreetingCategory,
  GreetingUnderstanding,
  DynamicResponseComposition,
} from '../types/greeting.types';
import { emojiIntelligence } from '../emoji/emoji.intelligence';
import { conversationStarterLibrary } from '../starters/conversation.starter.library';
import { ProcessingContext } from '../../../normalization/types/processing-context.types';
import { greetingDictionary } from '../dictionaries/greeting.dictionary';

export class GreetingResponseComposer {
  public compose(
    category: GreetingCategory,
    context: ProcessingContext,
    understanding: GreetingUnderstanding,
    turnCount: number = 1,
    sessionId?: string
  ): DynamicResponseComposition {
    const raw = (context.originalQuery || context.cleanQuery || '').toLowerCase().trim();
    const emojis = context.emojiMetadata?.emojis || [];
    const sessionIdVal = sessionId || 'anonymous';

    let result: DynamicResponseComposition;

    // 1. Specific Conversational Intelligence Examples
    if (/\b(what do you do for living|what do you do for a living|what is your job|what's your job)\b/i.test(raw)) {
      const fullText = "😊 I'm an AI assistant, so helping people learn about Mobiloitte is my full-time job.\n\nAsk me anything related to our company, services or technologies.";
      result = { opening: "😊 I'm an AI assistant", acknowledgement: 'Job acknowledged', starter: 'Ask me anything related to our company', fullText };
    } else if (/\b(what do you do)\b/i.test(raw)) {
      const fullText = "I answer questions related to Mobiloitte.\n\nWhether you're looking for company information, software services, technologies, careers or project consultation, I'm here to help.";
      result = { opening: 'I answer questions related to Mobiloitte.', acknowledgement: 'Role acknowledged', starter: 'How can I assist today?', fullText };
    } else if (/\b(how do you help|how can you help|how can you help me|what can you do|show your capabilities)\b/i.test(raw)) {
      const fullText = "I can help you with:\n• Company information\n• Services & Technologies\n• Careers & Job Vacancies\n• Office locations & Pricing\n• Contact & Consultation\n\nJust ask naturally!";
      result = { opening: 'I can help you with:', acknowledgement: 'Capabilities acknowledged', starter: 'Just ask naturally!', fullText };
    } else if (/\b(who are you|tell me about yourself|introduce yourself|who made you|are you a bot|are you ai|are you human|are you real|what is your name|your name|what are you)\b/i.test(raw)) {
      const fullText = "Hi! I'm Kaira, Mobiloitte's Enterprise AI Assistant.\n\nI help visitors discover information about Mobiloitte including our services, technologies, careers, offices and company details.\n\nHow can I help today?";
      result = { opening: "Hi! I'm Kaira, Mobiloitte's Enterprise AI Assistant.", acknowledgement: 'Identity acknowledged', starter: 'How can I help today?', fullText };
    } else if (/\b(i got a job|i passed|i am excited|i'm excited|im excited)\b/i.test(raw)) {
      const fullText = "That's fantastic news! 🎉 Congratulations! I'm really happy for you. Wishing you continued success ahead!";
      result = { opening: "That's fantastic news! 🎉", acknowledgement: 'Excitement acknowledged', starter: 'Wishing you continued success ahead!', fullText };
    } else if (/\b(i am sad|i'm sad|im sad|feeling stressed|i failed|i am stressed|i'm stressed|im stressed|i am tired|i'm tired|im tired)\b/i.test(raw)) {
      const fullText = "I'm really sorry to hear that. Take it easy today, and remember that challenges are stepping stones to success. Wishing you all the best!";
      result = { opening: "I'm really sorry to hear that.", acknowledgement: 'Empathy acknowledged', starter: 'Wishing you all the best!', fullText };
    } else if (/yoo+\s+broo+/i.test(raw) || raw.includes('yooo brooo') || (raw.includes('yooo') && raw.includes('bro')) || (raw.includes('yoo') && raw.includes('bro') && emojis.includes('🔥'))) {
      const fullText = 'Yooo! 😄🔥\n\nLove the energy!\n\nWhat exciting project are we building today?';
      result = { opening: 'Yooo! 😄🔥', acknowledgement: 'Energy acknowledged', starter: 'What exciting project are we building today?', fullText };
    } else if (raw.includes('kaise ho') || raw.includes('kya haal')) {
      const pool = greetingDictionary.regionalResponses.kaiseho || [];
      const hash = this.getSessionOffset(sessionIdVal);
      const index = (turnCount - 1 + hash) % (pool.length || 1);
      const fullText = pool[index] || 'Main badhiya hoon, shukriya! 😊\n\nAap bataiye, aaj kya janna chahenge?';
      result = { opening: 'Main badhiya hoon, shukriya! 😊', acknowledgement: 'Hinglish acknowledged', starter: 'Aap bataiye, aaj kya janna chahenge?', fullText };
    } else if (raw.includes('aur bhai') || raw.includes('aur dost')) {
      const pool = greetingDictionary.regionalResponses.aurbhai || [];
      const hash = this.getSessionOffset(sessionIdVal);
      const index = (turnCount - 1 + hash) % (pool.length || 1);
      const fullText = pool[index] || 'Sab badhiya! 😄\n\nBatao dost, aaj kya help chahiye?';
      result = { opening: 'Sab badhiya! 😄', acknowledgement: 'Friendly Hinglish acknowledged', starter: 'Batao dost, aaj kya help chahiye?', fullText };
    } else if (raw.includes('team') || raw.includes('everyone') || raw.includes('all')) {
      const fullText = 'Hello Team! 👋\n\nHope you all are having a great day. How can I assist everyone today?';
      result = { opening: 'Hello Team! 👋', acknowledgement: 'Group acknowledged', starter: 'How can I assist everyone today?', fullText };
    } else if (understanding.categories && understanding.categories.length > 1) {
      // 2. Multi-intent composition
      const fullText = this.composeMultiIntentResponse(understanding.categories, turnCount, sessionIdVal, raw);
      result = {
        opening: 'Hello! 👋',
        acknowledgement: `Merged multiple intents: ${understanding.categories.join(', ')}`,
        starter: 'How can I assist you today?',
        fullText,
      };
    } else if (emojis.length > 0 || raw.includes('❤️')) {
      // 3. Emoji Intelligence Check
      const emojiResponse = emojiIntelligence.getEmojiResponse(emojis, context.originalQuery || context.cleanQuery, turnCount, sessionIdVal);
      if (emojiResponse) {
        result = {
          opening: emojiResponse.split('\n')[0] || 'Hello! 👋',
          acknowledgement: 'Emoji acknowledged',
          starter: conversationStarterLibrary.getStarter(understanding.persona, understanding.contextType, turnCount, sessionIdVal),
          fullText: emojiResponse,
        };
      } else {
        const fullText = this.getTemplate(category, turnCount, sessionIdVal, raw);
        const opening = fullText.split('\n')[0] || 'Hello! 👋';
        result = {
          opening,
          acknowledgement: `Acknowledged ${understanding.style} ${understanding.emotion} greeting`,
          starter: conversationStarterLibrary.getStarter(understanding.persona, understanding.contextType, turnCount, sessionIdVal),
          fullText,
        };
      }
    } else {
      // 4. Dynamic composition fallback using dynamic pools and rotation
      const fullText = this.getTemplate(category, turnCount, sessionIdVal, raw);
      const opening = fullText.split('\n')[0] || 'Hello! 👋';
      result = {
        opening,
        acknowledgement: `Acknowledged ${understanding.style} ${understanding.emotion} greeting`,
        starter: conversationStarterLibrary.getStarter(understanding.persona, understanding.contextType, turnCount, sessionIdVal),
        fullText,
      };
    }

    if (turnCount === 1) {
      result.fullText = this.sanitizeFirstGreeting(result.fullText);
      result.opening = this.sanitizeFirstGreeting(result.opening);
    }

    return result;
  }

  private composeMultiIntentResponse(categories: GreetingCategory[], turnCount: number, sessionId?: string, rawInput?: string): string {
    let opening = "";
    let body = "";
    let closing = "";

    const hasGreeting = categories.some(c => ['Standard', 'Time Based', 'Indian', 'Hinglish', 'Emoji'].includes(c));
    const hasThanks = categories.includes('Thanks');
    const hasFarewell = categories.includes('Farewell');
    const hasHelp = categories.includes('Help') || categories.includes('Capabilities');
    const hasAppreciation = categories.includes('Appreciation') || categories.includes('Compliments');
    const hasSmallTalk = categories.includes('Small Talk');
    const hasBotIntro = categories.includes('Bot Intro');

    // 1. Premium Single Responses for common mixed combinations
    if (hasGreeting && hasThanks && hasFarewell) {
      const greetCat = categories.find(c => ['Standard', 'Time Based', 'Indian', 'Hinglish', 'Emoji'].includes(c))!;
      const greetText = this.getTemplate(greetCat, turnCount, sessionId, rawInput);
      const prefix = greetText.split('\n\n')[0] || greetText;
      return `${prefix} You're very welcome. It was great chatting with you. Have a wonderful day and feel free to reach out anytime!`;
    }

    if (hasThanks && hasFarewell) {
      return "You're very welcome. It was great chatting with you. Have a wonderful day and feel free to reach out anytime!";
    }

    if (hasGreeting && hasSmallTalk) {
      const greetCat = categories.find(c => ['Standard', 'Time Based', 'Indian', 'Hinglish', 'Emoji'].includes(c))!;
      const greetText = this.getTemplate(greetCat, turnCount, sessionId, rawInput);
      const prefix = greetText.split('\n\n')[0] || greetText;
      const cleanPrefix = prefix.split('!')[0] + '! 👋';
      const talkText = this.getTemplate('Small Talk', turnCount, sessionId, rawInput);
      return `${cleanPrefix} ${talkText}`;
    }

    if (hasGreeting && hasBotIntro) {
      const greetCat = categories.find(c => ['Standard', 'Time Based', 'Indian', 'Hinglish', 'Emoji'].includes(c))!;
      const greetText = this.getTemplate(greetCat, turnCount, sessionId, rawInput);
      const prefix = greetText.split('\n\n')[0] || greetText;
      const cleanPrefix = prefix.split('!')[0] + '! 👋';
      const introText = this.getTemplate('Bot Intro', turnCount, sessionId, rawInput);
      return `${cleanPrefix} ${introText}`;
    }

    if (hasGreeting && hasHelp) {
      const greetCat = categories.find(c => ['Standard', 'Time Based', 'Indian', 'Hinglish', 'Emoji'].includes(c))!;
      const greetText = this.getTemplate(greetCat, turnCount, sessionId, rawInput);
      const prefix = greetText.split('\n\n')[0] || greetText;
      const cleanPrefix = prefix.split('!')[0] + '! 👋';
      return `${cleanPrefix} Absolutely! I'd be happy to help. What would you like to know about Mobiloitte today?`;
    }

    if (hasGreeting && hasThanks) {
      const greetCat = categories.find(c => ['Standard', 'Time Based', 'Indian', 'Hinglish', 'Emoji'].includes(c))!;
      const greetText = this.getTemplate(greetCat, turnCount, sessionId, rawInput);
      const prefix = greetText.split('\n\n')[0] || greetText;
      const cleanPrefix = prefix.split('!')[0] + '! 👋';
      return `${cleanPrefix} You're very welcome. Let me know if there's anything else you'd like to explore today!`;
    }

    if (hasGreeting && hasFarewell) {
      const greetCat = categories.find(c => ['Standard', 'Time Based', 'Indian', 'Hinglish', 'Emoji'].includes(c))!;
      const greetText = this.getTemplate(greetCat, turnCount, sessionId, rawInput);
      const prefix = greetText.split('\n\n')[0] || greetText;
      const cleanPrefix = prefix.split('!')[0] + '! 👋';
      return `${cleanPrefix} Have a wonderful day and take care! Feel free to reach out whenever you need assistance.`;
    }

    // Fallback block-based formatting
    if (hasGreeting) {
      const greetCat = categories.find(c => ['Standard', 'Time Based', 'Indian', 'Hinglish', 'Emoji'].includes(c))!;
      const greetText = this.getTemplate(greetCat, turnCount, sessionId, rawInput);
      opening = greetText.split('\n\n')[0] || greetText;
    }

    const bodyParts: string[] = [];
    if (hasHelp) {
      bodyParts.push(this.getTemplate('Capabilities', turnCount, sessionId, rawInput));
    }
    if (hasAppreciation) {
      bodyParts.push(this.getTemplate('Compliments', turnCount, sessionId, rawInput));
    }
    if (hasThanks) {
      bodyParts.push(this.getTemplate('Thanks', turnCount, sessionId, rawInput));
    }
    body = bodyParts.join('\n\n');

    if (hasFarewell) {
      closing = this.getTemplate('Farewell', turnCount, sessionId, rawInput);
    }

    const parts = [opening, body, closing].map(p => p.trim()).filter(Boolean);
    return parts.join('\n\n');
  }

  private getTemplate(category: GreetingCategory, turnCount: number, sessionId?: string, queryText?: string): string {
    const dict = greetingDictionary;
    let pool: string[] = [];

    switch (category) {
      case 'Standard':
        if (turnCount > 1) {
          pool = dict.responsesPool.repeat || dict.responsesPool.hi || [];
        } else {
          pool = dict.responsesPool.hi || [];
        }
        break;
      case 'Time Based': {
        const lowerRaw = queryText ? queryText.toLowerCase() : "";
        if (lowerRaw.includes('morning') || lowerRaw.includes('gm')) {
          pool = dict.responsesPool.goodmorning || [];
        } else if (lowerRaw.includes('afternoon')) {
          pool = dict.responsesPool.goodafternoon || [];
        } else if (lowerRaw.includes('evening') || lowerRaw.includes('eve')) {
          pool = dict.responsesPool.goodevening || [];
        } else if (lowerRaw.includes('night') || lowerRaw.includes('gn')) {
          pool = dict.responsesPool.goodnight || [];
        } else {
          const hour = new Date().getHours();
          if (hour >= 5 && hour < 12) pool = dict.responsesPool.goodmorning || [];
          else if (hour >= 12 && hour < 17) pool = dict.responsesPool.goodafternoon || [];
          else if (hour >= 17 && hour < 21) pool = dict.responsesPool.goodevening || [];
          else pool = dict.responsesPool.goodnight || [];
        }
        break;
      }
      case 'Indian':
        pool = dict.regionalResponses.namaste || dict.regionalResponses.ramram || [];
        break;
      case 'Hinglish':
        pool = dict.regionalResponses.kaiseho || dict.regionalResponses.aurbhai || [];
        break;
      case 'Thanks':
        pool = dict.responsesPool.thanks || dict.responsesPool.gratitude || [];
        break;
      case 'Farewell':
        pool = dict.responsesPool.farewell || [];
        break;
      case 'Help':
      case 'Capabilities':
        pool = dict.responsesPool.capability || dict.responsesPool.help || [];
        break;
      case 'Appreciation':
      case 'Compliments':
        pool = dict.responsesPool.compliments || dict.responsesPool.appreciation || [];
        break;
      case 'Small Talk':
        pool = dict.responsesPool.smallTalk || [];
        break;
      case 'User Status Positive':
        pool = dict.responsesPool.userStatusPositive || [];
        break;
      case 'User Status Negative':
        pool = dict.responsesPool.userStatusNegative || [];
        break;
      case 'Bot Intro':
        pool = dict.responsesPool.botIntro || [];
        break;
      case 'Motivation':
        pool = dict.responsesPool.motivation || [];
        break;
      case 'Jokes':
        pool = dict.responsesPool.jokes || [];
        break;
      case 'Conversation Continuation':
        pool = dict.responsesPool.continuation || [];
        break;
      case 'Confirmation':
        pool = dict.acknowledgements.confirmations || [];
        break;
      case 'Apology':
        pool = dict.responsesPool.generic || [];
        break;
      case 'Confusion':
        pool = dict.responsesPool.generic || [];
        break;
      case 'Emoji':
        pool = dict.emojiResponses.wave || dict.emojiResponses.smile || [];
        break;
      default:
        pool = dict.responsesPool.generic || [];
    }

    if (pool.length === 0) {
      pool = dict.responsesPool.generic || ['Hello! 👋 Hope you are having a great day. How can I help you today?'];
    }

    const hash = this.getSessionOffset(sessionId);
    const index = (turnCount - 1 + hash) % pool.length;
    return (pool[index] || pool[0]).trim();
  }

  private getSessionOffset(sessionId?: string): number {
    if (!sessionId) return 0;
    let hash = 0;
    for (let i = 0; i < sessionId.length; i++) {
      hash = (hash << 5) - hash + sessionId.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private sanitizeFirstGreeting(template: string): string {
    let sanitized = template;
    sanitized = sanitized.replace(/\bwelcome back again\b/gi, "Welcome");
    sanitized = sanitized.replace(/\bwelcome back\b/gi, "Welcome");
    sanitized = sanitized.replace(/\bnice to see you again\b/gi, "Great to see you");
    sanitized = sanitized.replace(/\bgood to see you again\b/gi, "Great to see you");
    sanitized = sanitized.replace(/\bglad you're back\b/gi, "Glad you stopped by");
    sanitized = sanitized.replace(/\bhello again\b/gi, "Hello");
    sanitized = sanitized.replace(/\bhi again\b/gi, "Hi");
    sanitized = sanitized.replace(/\bglad to connect again\b/gi, "glad to connect");
    sanitized = sanitized.replace(/\s+again\b/gi, "");
    return sanitized;
  }
}

export const greetingResponseComposer = new GreetingResponseComposer();
