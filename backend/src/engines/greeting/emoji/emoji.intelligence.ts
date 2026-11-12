import { greetingDictionary } from '../dictionaries/greeting.dictionary';

export class EmojiIntelligence {
  public getEmojiResponse(emojis: string[], rawText: string = '', turnCount: number = 1, sessionId?: string): string | undefined {
    const raw = rawText.toLowerCase();
    const dict = greetingDictionary;

    const hash = this.getSessionOffset(sessionId);

    if (raw.includes('❤️') || (emojis && emojis.some((e) => e.includes('❤️') || e.includes('\u2764')))) {
      const pool = dict.emojiResponses.heart || ['❤️ Thank you!'];
      const index = (turnCount - 1 + hash) % pool.length;
      return pool[index] || pool[0];
    }

    if (!emojis || emojis.length === 0) return undefined;

    const firstEmoji = emojis[0];
    let pool: string[] = [];

    switch (firstEmoji) {
      case '👋':
        pool = dict.emojiResponses.wave || [];
        break;
      case '😊':
      case '😄':
      case '😀':
      case '😁':
        pool = dict.emojiResponses.smile || [];
        break;
      case '🙏':
        pool = dict.emojiResponses.namaste || [];
        break;
      case '❤️':
        pool = dict.emojiResponses.heart || [];
        break;
      case '👍':
        pool = dict.emojiResponses.thumbsup || [];
        break;
      case '🎉':
      case '🥳':
        pool = dict.emojiResponses.congrats || [];
        break;
      case '🔥':
        pool = dict.emojiResponses.energy || [];
        break;
      case '🤝':
        pool = dict.emojiResponses.handshake || [];
        break;
      case '👏':
      case '🙌':
        pool = dict.emojiResponses.applause || [];
        break;
      case '💯':
      case '✨':
        pool = dict.emojiResponses.sparkles || [];
        break;
      case '😎':
        pool = dict.emojiResponses.cool || [];
        break;
      default:
        return undefined;
    }

    if (pool.length > 0) {
      const index = (turnCount - 1 + hash) % pool.length;
      return pool[index] || pool[0];
    }
    return undefined;
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
}

export const emojiIntelligence = new EmojiIntelligence();
