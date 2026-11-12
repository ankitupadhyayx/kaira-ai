import { ProcessingContext } from '../../../normalization/types/processing-context.types';
import {
  GreetingCategory,
  GreetingUnderstanding,
  GreetingLanguage,
  GreetingStyle,
  GreetingEmotion,
  GreetingEnergy,
  GreetingPoliteness,
  GreetingFormality,
  GreetingAudience,
  GreetingDetectionDetails,
} from '../types/greeting.types';
import { greetingPersonaEngine } from '../persona/greeting.persona.engine';
import { greetingContextEngine } from '../context-engine/greeting.context.engine';

export class GreetingUnderstandingLayer {
  public analyze(
    context: ProcessingContext,
    category: GreetingCategory,
    matchedGreeting?: string,
    detection?: GreetingDetectionDetails
  ): GreetingUnderstanding {
    const raw = (context.originalQuery || context.cleanQuery || '').toLowerCase().trim();
    const norm = (context.normalizedQuery || '').toLowerCase().trim();

    const language = this.detectLanguage(raw, norm, category, context);
    const audience = this.detectAudience(raw, norm);
    const energy = this.detectEnergy(raw, context);
    const emotion = this.detectEmotion(raw, context, energy);
    const style = this.detectStyle(raw, norm, category, language);
    const formality = this.detectFormality(raw, audience, style);
    const politeness = this.detectPoliteness(raw, formality, emotion);
    const persona = greetingPersonaEngine.inferPersona(context);
    const contextType = greetingContextEngine.inferContextType(context, category);

    return {
      language,
      style,
      emotion,
      energy,
      politeness,
      formality,
      audience,
      persona,
      contextType,
      categories: detection?.categories || [category],
    };
  }

  private detectLanguage(
    raw: string,
    norm: string,
    category: GreetingCategory,
    context: ProcessingContext
  ): GreetingLanguage {
    if (category === 'Hinglish' || raw.includes('kaise ho') || raw.includes('aur bhai') || raw.includes('kya haal')) {
      return 'Hinglish';
    }
    if (category === 'Indian' || raw.includes('namaste') || raw.includes('ram ram') || raw.includes('pranam')) {
      return 'Hindi';
    }
    if (category === 'Regional' || raw.includes('vanakkam') || raw.includes('kem cho') || raw.includes('sat sri akal') || raw.includes('adaab')) {
      return 'Regional';
    }
    if (context.language === 'hi-en' || context.language === 'mixed') {
      return 'Hinglish';
    }
    return 'English';
  }

  private detectAudience(raw: string, norm: string): GreetingAudience {
    if (raw.includes('sir') || raw.includes('maam') || raw.includes('madam')) return 'Sir';
    if (raw.includes('ceo')) return 'CEO';
    if (raw.includes('team') || raw.includes('everyone') || raw.includes('all')) return 'Team';
    if (raw.includes('bro') || raw.includes('bhai') || raw.includes('dost') || raw.includes('mate') || raw.includes('buddy')) return 'Bro';
    return 'Generic';
  }

  private detectEnergy(raw: string, context: ProcessingContext): GreetingEnergy {
    const hasRepeatedChars = /(.)\1{2,}/.test(raw);
    const exclamationCount = (raw.match(/!/g) || []).length;
    if (hasRepeatedChars || exclamationCount >= 2 || raw.includes('yoo')) {
      return 'High';
    }
    if (raw.length <= 4) return 'Calm';
    return 'Medium';
  }

  private detectEmotion(raw: string, context: ProcessingContext, energy: GreetingEnergy): GreetingEmotion {
    const emojis = context.emojiMetadata?.emojis || [];
    if (emojis.includes('😂') || emojis.includes('😄') || emojis.includes('😀') || emojis.includes('😊') || raw.includes('haha')) {
      return 'Happy';
    }
    if (emojis.includes('🙏') || raw.includes('namaste') || raw.includes('ram ram') || raw.includes('pranam') || raw.includes('sir')) {
      return 'Respectful';
    }
    if (energy === 'High' || energy === 'Very High') {
      return 'Excited';
    }
    return 'Neutral';
  }

  private detectStyle(raw: string, norm: string, category: GreetingCategory, language: GreetingLanguage): GreetingStyle {
    if (category === 'Emoji' || raw.includes('👋') || raw.includes('🙏') || raw.includes('😄')) return 'Emoji';
    if (language === 'Hinglish' || raw.includes('kaise ho') || raw.includes('aur bhai')) return 'Hinglish';
    if (language === 'Hindi' || language === 'Regional' || category === 'Indian') return 'Indian';
    if (raw.includes('yo') || raw.includes('sup') || raw.includes('wassup') || raw.includes('bro')) return 'Gen-Z';
    if (raw.includes('sir') || raw.includes('maam') || raw.includes('dear') || raw.includes('respected')) return 'Formal';
    if (raw.includes('ceo') || raw.includes('mobiloitte') || raw.includes('team')) return 'Professional';
    return 'Casual';
  }

  private detectFormality(raw: string, audience: GreetingAudience, style: GreetingStyle): GreetingFormality {
    if (audience === 'Sir' || audience === 'CEO' || style === 'Formal') return 'Formal';
    if (style === 'Gen-Z' || style === 'Hinglish' || audience === 'Bro') return 'Casual';
    return 'Semi-Formal';
  }

  private detectPoliteness(raw: string, formality: GreetingFormality, emotion: GreetingEmotion): GreetingPoliteness {
    if (formality === 'Formal' || emotion === 'Respectful') return 'Very Polite';
    if (formality === 'Casual') return 'Informal';
    return 'Polite';
  }
}

export const greetingUnderstandingLayer = new GreetingUnderstandingLayer();
