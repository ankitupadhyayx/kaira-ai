import { INormalizerStage } from '../interfaces/INormalizer';
import { EmojiMetadata } from '../types/processing-context.types';

export interface EmojiProcessingResult {
  textWithoutEmojis: string;
  emojiMetadata: EmojiMetadata;
}

const GREETING_EMOJIS = new Set(['👋', '🙏', '🤝', '👐', '🙌', '👏', '🫶', '🤙', '✌️', '🤞', '❤️', '💖', '🎉', '👍', '✨', '🔥', '🚀', '😊', '😄', '😄🔥']);
const EMOTION_EMOJIS = new Set([
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😇', '🙂', '🙃',
  '😉', '😊', '😋', '😍', '🥰', '😘', '😗', '😙', '😚', '☺️',
  '🙁', '😞', '😟', '😢', '😭', '😡', '🤬', '😤', '😠',
]);

export class EmojiProcessor
  implements INormalizerStage<string, EmojiProcessingResult>
{
  public readonly name = 'EmojiProcessor';

  private static readonly EMOJI_REGEX = /[\p{Emoji_Presentation}\p{Extended_Pictographic}\u2700-\u27BF\uFE00-\uFE0F]/gu;

  public process(input: string): EmojiProcessingResult {
    if (!input) {
      return {
        textWithoutEmojis: '',
        emojiMetadata: { emojis: [], count: 0, isEmojiOnly: false, hasGreetingEmoji: false, hasEmotionEmoji: false },
      };
    }

    const matches = input.match(EmojiProcessor.EMOJI_REGEX) || [];
    const emojis = Array.from(matches);

    // Remove emojis from the text
    const textWithoutEmojis = input
      .replace(EmojiProcessor.EMOJI_REGEX, ' ')
      .replace(/ +/g, ' ')
      .trim();

    const isEmojiOnly = emojis.length > 0 && textWithoutEmojis.length === 0;
    const hasGreetingEmoji = emojis.some((e) => GREETING_EMOJIS.has(e));
    const hasEmotionEmoji = emojis.some((e) => EMOTION_EMOJIS.has(e));

    return {
      textWithoutEmojis,
      emojiMetadata: {
        emojis,
        count: emojis.length,
        isEmojiOnly,
        hasGreetingEmoji,
        hasEmotionEmoji,
      },
    };
  }
}
