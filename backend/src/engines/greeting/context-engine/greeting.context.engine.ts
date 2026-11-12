import { ProcessingContext } from '../../../normalization/types/processing-context.types';
import { GreetingCategory, GreetingContextType } from '../types/greeting.types';

export class GreetingContextEngine {
  public inferContextType(
    context: ProcessingContext,
    category: GreetingCategory,
    turnCount: number = 1
  ): GreetingContextType {
    const raw = (context.originalQuery || context.cleanQuery || '').toLowerCase().trim();
    const tokens = context.normalizedTokens;

    if (tokens.length >= 8) {
      return 'Greeting + Long Text';
    }
    if (category === 'Greeting + Intent' || context.normalizedTokens.length > 2) {
      return 'Greeting + Intent';
    }
    if (raw.includes('team') || raw.includes('everyone') || raw.includes('all')) {
      return 'Greeting + Team';
    }
    if (raw.includes('mobiloitte') || raw.includes('company')) {
      return 'Greeting + Company';
    }
    if (context.emojiMetadata?.count > 0) {
      return 'Greeting + Emoji';
    }
    if (category === 'Indian' || raw.includes('namaste') || raw.includes('ram ram')) {
      return 'Greeting + Regional Greeting';
    }
    if (category === 'Time Based') {
      return 'Greeting + Time';
    }
    if (category === 'Multiple Greetings') {
      return 'Greeting + Multiple Greetings';
    }
    if (turnCount > 1) {
      return 'Repeated Greeting';
    }

    return 'First Visit';
  }
}

export const greetingContextEngine = new GreetingContextEngine();
