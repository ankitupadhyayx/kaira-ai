import { IDetector } from '../base-detector';
import { ProcessingContext } from '../../../../normalization/types/processing-context.types';
import { DetectorResult } from '../../types/gibberish.types';

export class EmojiSpamDetector implements IDetector {
  public readonly name = 'EmojiSpamDetector';

  private static readonly MAX_ALLOWED_EMOJIS = 4;

  public detect(context: ProcessingContext): DetectorResult {
    const emojiMeta = context.emojiMetadata;
    const emojiCount = emojiMeta?.count || 0;
    const emojis = emojiMeta?.emojis || [];

    if (emojiCount === 0) {
      return this.buildResult(0, 0, 0, []);
    }

    // Single or double emoji (especially greeting or emotion) is NOT spam
    if (emojiCount <= 2 && (emojiMeta?.hasGreetingEmoji || emojiMeta?.hasEmotionEmoji)) {
      return this.buildResult(0, 0, emojiCount, emojis);
    }

    // Calculate score based on emoji density and total count
    const totalChars = context.characterStats?.totalChars || 1;
    const emojiRatio = emojiCount / Math.max(totalChars, 1);

    if (emojiCount >= EmojiSpamDetector.MAX_ALLOWED_EMOJIS || (emojiCount >= 3 && emojiRatio > 0.6)) {
      const score = Math.min(1.0, 0.6 + (emojiCount / 10));
      const confidence = emojiCount >= 5 ? 0.95 : 0.90;
      return this.buildResult(score, confidence, emojiCount, emojis);
    }

    return this.buildResult(0, 0, emojiCount, emojis);
  }

  private buildResult(score: number, confidence: number, count: number, emojis: string[]): DetectorResult {
    return {
      detectorName: this.name,
      score,
      confidence,
      matchedReason: 'EMOJI_SPAM',
      metadata: {
        count,
        emojis,
      },
    };
  }
}
