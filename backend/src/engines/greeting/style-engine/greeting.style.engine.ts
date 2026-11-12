import { GreetingCategory, GreetingStyle, GreetingEmotion, UserPersona } from '../types/greeting.types';

export class GreetingStyleEngine {
  public resolveStyle(
    category: GreetingCategory,
    emotion: GreetingEmotion,
    persona: UserPersona,
    rawText: string
  ): GreetingStyle {
    const raw = rawText.toLowerCase();

    if (raw.includes('yo') || raw.includes('sup') || raw.includes('wassup') || raw.includes('bro')) {
      return 'Gen-Z';
    }
    if (category === 'Hinglish' || raw.includes('kaise ho') || raw.includes('aur bhai')) {
      return 'Hinglish';
    }
    if (category === 'Indian' || raw.includes('namaste') || raw.includes('ram ram')) {
      return 'Indian';
    }
    if (category === 'Emoji' || raw.includes('👋') || raw.includes('🙏') || raw.includes('🔥')) {
      return 'Emoji';
    }
    if (persona === 'Business Client' || persona === 'Enterprise Customer') {
      return 'Corporate';
    }
    if (emotion === 'Excited') {
      return 'Energetic';
    }
    if (emotion === 'Respectful') {
      return 'Respectful';
    }

    return 'Friendly';
  }
}

export const greetingStyleEngine = new GreetingStyleEngine();
