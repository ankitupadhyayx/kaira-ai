import { ProcessingContext } from '../../../normalization/types/processing-context.types';
import { GreetingCategory, GreetingDetectionDetails } from '../types/greeting.types';

const INDIAN_KEYWORDS = new Set([
  'namaste', 'namaskar', 'ram ram', 'pranam', 'charan sparsh',
  'sat sri akal', 'vanakkam', 'kem cho', 'adaab', 'khamma ghani', 'sita ram', 'jai shree ram',
]);

const REGIONAL_KEYWORDS = new Set([
  'bonjour', 'hola', 'ciao', 'ola', 'konnichiwa', 'salaam', 'assalamu alaikum', 'aloha', 'buenas',
]);

const BUSINESS_KEYWORDS = new Set([
  'mobiloitte', 'team', 'ceo', 'cto', 'assistant', 'bot', 'ai', 'company', 'office',
]);

const TIME_PHRASES = new Set([
  'good morning', 'good afternoon', 'good evening', 'good night', 'gm', 'gn', 'ga', 'ge', 'mornin', 'evening',
]);

export class GreetingClassifier {
  public classify(detection: GreetingDetectionDetails, context: ProcessingContext): GreetingCategory {
    if (!detection.detected) {
      return 'Standard';
    }

    // Preserve explicit deterministic intent categories
    if (['Farewell', 'Thanks', 'Apology', 'Confirmation', 'Appreciation', 'Confusion', 'Help', 'Time Based', 'Indian', 'Hinglish', 'Emoji', 'Multiple Greetings', 'Greeting + Intent', 'Small Talk', 'User Status Positive', 'User Status Negative', 'Bot Intro', 'Capabilities', 'Compliments', 'Motivation', 'Jokes', 'Conversation Continuation'].includes(detection.category)) {
      return detection.category;
    }

    // 1. Emoji check
    if (detection.category === 'Emoji' || context.emojiMetadata.isEmojiOnly) {
      return 'Emoji';
    }

    // 2. Multiple Greetings check
    if (detection.category === 'Multiple Greetings') {
      return 'Multiple Greetings';
    }

    const matchedText = (detection.span?.matchedText || '').toLowerCase();
    const cleanLower = context.cleanQuery.toLowerCase();
    const originalLower = context.originalQuery.toLowerCase();

    // Check if original query contained Indian greeting before Hinglish normalization
    const isIndianOriginal = Array.from(INDIAN_KEYWORDS).some(
      (kw) => originalLower.includes(kw) || cleanLower.includes(kw) || matchedText.includes(kw)
    );

    if (isIndianOriginal) {
      if (detection.hasBusinessIntent) {
        return 'Greeting + Intent';
      }
      return 'Indian';
    }

    // 3. Greeting + Intent (Highest precedence when residual tokens are present)
    if (detection.hasBusinessIntent && detection.residualTokens.length > 0) {
      return 'Greeting + Intent';
    }

    // 4. Conversation Continuation
    if (/\b(again|back|still)\b/i.test(context.normalizedQuery)) {
      return 'Conversation Continuation';
    }

    // 5. Time Based
    if (TIME_PHRASES.has(matchedText) || /\b(good morning|good afternoon|good evening|good night|gm|gn)\b/i.test(matchedText)) {
      return 'Time Based';
    }

    // 6. Regional Greetings
    if (REGIONAL_KEYWORDS.has(matchedText) || Array.from(REGIONAL_KEYWORDS).some((r) => originalLower.includes(r))) {
      return 'Regional';
    }

    // 7. Hinglish
    if (context.language === 'hi-en' || /\b(hlo|ji|bhai)\b/i.test(matchedText) || /\b(hlo|ji|bhai)\b/i.test(cleanLower)) {
      return 'Hinglish';
    }

    // 8. Business Greetings
    if (BUSINESS_KEYWORDS.has(matchedText) || Array.from(BUSINESS_KEYWORDS).some((kw) => originalLower.includes(kw))) {
      return 'Business';
    }

    // 9. Informal / Gen-Z
    if (/\b(yo|sup|wassup|wazzup|whatsup|hey buddy|hiya)\b/i.test(matchedText)) {
      return 'Informal';
    }

    // 10. Formal / Professional
    if (/\b(dear sir|salutations|greetings|dear ma'am)\b/i.test(matchedText)) {
      return 'Formal';
    }

    return 'Standard';
  }
}
