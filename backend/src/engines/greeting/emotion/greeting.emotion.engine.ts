import { ProcessingContext } from '../../../normalization/types/processing-context.types';
import { GreetingEmotion, GreetingEnergy } from '../types/greeting.types';

export interface EmotionAnalysis {
  emotion: GreetingEmotion;
  energy: GreetingEnergy;
}

export class GreetingEmotionEngine {
  public analyze(context: ProcessingContext): EmotionAnalysis {
    const raw = (context.originalQuery || context.cleanQuery || '').toLowerCase().trim();
    const emojis = context.emojiMetadata?.emojis || [];

    let energy: GreetingEnergy = 'Medium';
    const hasRepeatedLetters = /(.)\1{2,}/.test(raw);
    const exclamationCount = (raw.match(/!/g) || []).length;
    const fireEmojiCount = emojis.filter((e) => e === '🔥' || e === '🎉' || e === '💯').length;

    if (hasRepeatedLetters || exclamationCount >= 2 || fireEmojiCount > 0 || raw.includes('yooo')) {
      energy = fireEmojiCount > 1 || exclamationCount >= 3 ? 'Very High' : 'High';
    } else if (raw.length <= 4 && exclamationCount === 0) {
      energy = 'Low';
    }

    let emotion: GreetingEmotion = 'Neutral';

    if (emojis.includes('🔥') || emojis.includes('🎉') || energy === 'Very High' || raw.includes('brooo')) {
      emotion = 'Excited';
    } else if (emojis.includes('😄') || emojis.includes('😀') || emojis.includes('😊') || raw.includes('haha')) {
      emotion = 'Happy';
    } else if (emojis.includes('❤️') || emojis.includes('💖') || emojis.includes('💕')) {
      emotion = 'Warm';
    } else if (emojis.includes('🙏') || raw.includes('namaste') || raw.includes('pranam') || raw.includes('sir')) {
      emotion = 'Respectful';
    } else if (raw.includes('career') || raw.includes('job') || raw.includes('hiring') || raw.includes('interview')) {
      emotion = 'Curious';
    } else if (raw.includes('ceo') || raw.includes('company') || raw.includes('services')) {
      emotion = 'Business';
    } else if (energy === 'High') {
      emotion = 'Friendly';
    }

    return { emotion, energy };
  }
}

export const greetingEmotionEngine = new GreetingEmotionEngine();
