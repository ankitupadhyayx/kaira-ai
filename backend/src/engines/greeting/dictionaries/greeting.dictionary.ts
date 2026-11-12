import greetingsData from '../../../data/greetings.json';
import emojiGreetingsData from '../../../data/emoji-greetings.json';
import regionalGreetingsData from '../../../data/regional-greetings.json';
import greetingAliasesData from '../../../data/greeting-aliases.json';
import greetingResponsesData from '../../../data/greeting-responses.json';

// Newly added JSON files
import acknowledgementsData from '../../../data/acknowledgements.json';
import emotionsData from '../../../data/emotions.json';
import conversationStartersData from '../../../data/conversation-starters.json';
import emojiResponsesData from '../../../data/emoji-responses.json';
import regionalResponsesData from '../../../data/regional-responses.json';
import typoNormalizationData from '../../../data/typo-normalization.json';
import aliasesData from '../../../data/aliases.json';
import synonymsData from '../../../data/synonyms.json';
import responsesData from '../../../data/responses.json';

import { GreetingCategory } from '../types/greeting.types';

export interface GreetingPhraseInfo {
  phrase: string;
  category: GreetingCategory;
  isMultiWord: boolean;
}

export class GreetingDictionary {
  private static instance: GreetingDictionary;

  public readonly phrasesMap: Map<string, GreetingPhraseInfo> = new Map();
  public readonly singleWordTokens: Set<string> = new Set();
  public readonly multiWordPhrases: GreetingPhraseInfo[] = [];
  public readonly emojiGreetings: Set<string> = new Set();
  public readonly aliasesMap: Map<string, string> = new Map();
  public readonly responsesPool: Record<string, string[]> = {};

  // Expose new datasets
  public readonly acknowledgements: Record<string, string[]> = acknowledgementsData;
  public readonly emotions: Record<string, string[]> = emotionsData;
  public readonly conversationStarters: Record<string, string[]> = conversationStartersData;
  public readonly emojiResponses: Record<string, string[]> = emojiResponsesData;
  public readonly regionalResponses: Record<string, string[]> = regionalResponsesData;
  public readonly typoNormalization: Record<string, string> = typoNormalizationData;
  public readonly aliases: Record<string, string> = aliasesData;
  public readonly synonyms: Record<string, string[]> = synonymsData;
  public readonly responses: Record<string, string[]> = responsesData;

  private constructor() {
    this.initializeData();
  }

  public static getInstance(): GreetingDictionary {
    if (!GreetingDictionary.instance) {
      GreetingDictionary.instance = new GreetingDictionary();
    }
    return GreetingDictionary.instance;
  }

  private initializeData(): void {
    // 1. Emoji Greetings
    const emojisList: string[] = (emojiGreetingsData as any).emojis || [];
    for (const emoji of emojisList) {
      this.emojiGreetings.add(emoji);
    }
    ['👋', '🙏', '🤝', '🙋‍♂️', '🙋‍♀️', '🙌', '✋', '🤙', '✌️', '😂', '😄', '😀', '❤️', '💖', '💕', '🎉', '🔥', '👏', '💯', '😎', '✨'].forEach((e) =>
      this.emojiGreetings.add(e)
    );

    // 2. Aliases
    const aliases: Record<string, string> = (greetingAliasesData as any).aliases || {};
    for (const [alias, canonical] of Object.entries(aliases)) {
      this.aliasesMap.set(alias.toLowerCase(), canonical.toLowerCase());
    }

    // Load newly defined aliases as well
    for (const [alias, canonical] of Object.entries(this.aliases)) {
      this.aliasesMap.set(alias.toLowerCase(), canonical.toLowerCase());
    }

    // 3. Responses Pools
    const rawResponses = greetingResponsesData as Record<string, any>;
    for (const [key, value] of Object.entries(rawResponses)) {
      if (Array.isArray(value)) {
        this.responsesPool[key] = value;
      }
    }

    // 4. Regional Greetings
    const regionalList: any[] = (regionalGreetingsData as any).regional || [];
    for (const r of regionalList) {
      const phrase = r.phrase.toLowerCase();
      const isMulti = phrase.includes(' ');
      const info: GreetingPhraseInfo = {
        phrase,
        category: (r.category === 'Indian' ? 'Indian' : 'Regional') as GreetingCategory,
        isMultiWord: isMulti,
      };
      this.phrasesMap.set(phrase, info);
      if (isMulti) {
        this.multiWordPhrases.push(info);
      } else {
        this.singleWordTokens.add(phrase);
      }
    }

    // 5. Main Greetings Dataset
    const greetingsList: any[] = (greetingsData as any).greetings || [];
    for (const g of greetingsList) {
      const phrase = g.phrase.toLowerCase();
      const category = this.mapCategoryString(g.category);
      const isMulti = phrase.includes(' ');
      const info: GreetingPhraseInfo = { phrase, category, isMultiWord: isMulti };

      this.phrasesMap.set(phrase, info);
      if (isMulti) {
        this.multiWordPhrases.push(info);
      } else {
        this.singleWordTokens.add(phrase);
      }

      if (Array.isArray(g.aliases)) {
        for (const alias of g.aliases) {
          const aliasLower = alias.toLowerCase();
          this.aliasesMap.set(aliasLower, phrase);
          if (!this.phrasesMap.has(aliasLower)) {
            const aliasInfo: GreetingPhraseInfo = { phrase: aliasLower, category, isMultiWord: aliasLower.includes(' ') };
            this.phrasesMap.set(aliasLower, aliasInfo);
            if (aliasInfo.isMultiWord) {
              this.multiWordPhrases.push(aliasInfo);
            } else {
              this.singleWordTokens.add(aliasLower);
            }
          }
        }
      }
    }

    // 6. Flat tokens fallback
    const flatTokens: string[] = (greetingsData as any).flatTokens || [];
    for (const token of flatTokens) {
      const tokLower = token.toLowerCase();
      const isMulti = tokLower.includes(' ');
      if (!this.phrasesMap.has(tokLower)) {
        const info: GreetingPhraseInfo = { phrase: tokLower, category: 'Standard', isMultiWord: isMulti };
        this.phrasesMap.set(tokLower, info);
        if (isMulti) {
          this.multiWordPhrases.push(info);
        } else {
          this.singleWordTokens.add(tokLower);
        }
      }
    }

    // Sort multi-word phrases by length descending
    this.multiWordPhrases.sort((a, b) => b.phrase.length - a.phrase.length);
  }

  private mapCategoryString(cat: string): GreetingCategory {
    switch (cat?.toLowerCase()) {
      case 'time-based':
      case 'time_based':
      case 'time based':
        return 'Time Based';
      case 'business':
        return 'Business';
      case 'professional':
        return 'Professional';
      case 'formal':
        return 'Formal';
      case 'informal':
      case 'casual':
      case 'slang':
        return 'Informal';
      case 'indian':
      case 'hindi':
        return 'Indian';
      case 'hinglish':
        return 'Hinglish';
      case 'regional':
        return 'Regional';
      case 'emoji':
        return 'Emoji';
      default:
        return 'Standard';
    }
  }

  public lookup(term: string): GreetingPhraseInfo | undefined {
    const lower = term.toLowerCase();
    if (this.phrasesMap.has(lower)) {
      return this.phrasesMap.get(lower);
    }
    const canonical = this.aliasesMap.get(lower);
    if (canonical && this.phrasesMap.has(canonical)) {
      return this.phrasesMap.get(canonical);
    }
    return undefined;
  }
}

export const greetingDictionary = GreetingDictionary.getInstance();
