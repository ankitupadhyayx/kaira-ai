import { INormalizerStage } from '../interfaces/INormalizer';
import { DetectedLanguage, LanguageDetectionResult } from '../types/processing-context.types';

// Unicode ranges for script detection
const DEVANAGARI_RANGE = /[\u0900-\u097F]/;
const LATIN_RANGE = /[a-zA-Z]/;
const DIGIT_RANGE = /[0-9]/;
const EMOJI_RANGE = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;

// Common Hinglish-indicative tokens (Roman Hindi words that appear in English text)
const HINGLISH_MARKERS = new Set([
  'kya', 'kyu', 'kyun', 'kab', 'kahan', 'kaise', 'kaun', 'hai', 'hain',
  'ho', 'ka', 'ki', 'ke', 'se', 'me', 'mein', 'aur', 'ya', 'nahi',
  'nahii', 'nahin', 'bhej', 'bta', 'btao', 'batao', 'dikhao', 'chahiye',
  'madad', 'shukriya', 'dhanyawad', 'namaste', 'namaskar', 'pucho',
  'jana', 'jaana', 'sampark', 'kaam', 'achha', 'theek', 'thik', 'acha',
  'hlo', 'haan', 'nhi', 'hoga', 'karo', 'sab', 'kuch', 'agar', 'toh',
  'jo', 'jab', 'lekin', 'par', 'bhi', 'sirf', 'bas', 'abhi', 'koi',
  'naam', 'ghar', 'desh', 'log', 'paise', 'kitna', 'kitni', 'kitne',
  'dam', 'daam', 'btao', 'bataiye', 'wala', 'wali', 'wale', 'tum',
  'aap', 'hum', 'main', 'mujhe', 'tumhe', 'unhe', 'inhe',
]);

export class LanguageDetector
  implements INormalizerStage<string, LanguageDetectionResult>
{
  public readonly name = 'LanguageDetector';

  public process(input: string): LanguageDetectionResult {
    if (!input || input.trim().length === 0) {
      return { language: 'unknown', confidence: 1.0 };
    }

    const text = input.trim();

    // Emoji-only check
    const withoutEmojis = text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
    if (withoutEmojis.length === 0 && text.length > 0) {
      return { language: 'emoji-only', confidence: 1.0 };
    }

    // Numeric-only check
    const withoutDigitsAndSpaces = text.replace(/[0-9\s.,+\-()#]/g, '').trim();
    if (withoutDigitsAndSpaces.length === 0) {
      return { language: 'numeric', confidence: 0.95 };
    }

    // Devanagari detection
    const hasDevanagari = DEVANAGARI_RANGE.test(text);
    const hasLatin = LATIN_RANGE.test(text);

    if (hasDevanagari && !hasLatin) {
      return { language: 'hi', confidence: 0.95 };
    }

    if (hasDevanagari && hasLatin) {
      return { language: 'mixed', confidence: 0.88 };
    }

    // Latin-only — check for Hinglish markers
    const words = text.toLowerCase().split(/\s+/);
    let hinglishHits = 0;
    for (const word of words) {
      if (HINGLISH_MARKERS.has(word)) hinglishHits++;
    }

    const hinglishRatio = words.length > 0 ? hinglishHits / words.length : 0;

    if (hinglishRatio >= 0.25) {
      const confidence = Math.min(0.95, 0.6 + hinglishRatio * 0.9);
      return { language: 'hi-en', confidence };
    }

    if (hinglishRatio > 0) {
      return { language: 'hi-en', confidence: 0.55 };
    }

    // Default: English
    const englishConfidence = hasLatin ? Math.min(0.98, 0.75 + (1 - hinglishRatio) * 0.2) : 0.5;
    return { language: 'en', confidence: englishConfidence };
  }
}
