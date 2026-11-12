import { ProcessingContext } from '../../../normalization/types/processing-context.types';
import { GreetingDetectionDetails, GreetingConfidenceScore } from '../types/greeting.types';
import { GREETING_CONFIDENCE_WEIGHTS } from '../constants/greeting.constants';

export class GreetingConfidenceCalculator {
  public calculate(detection: GreetingDetectionDetails, context: ProcessingContext): GreetingConfidenceScore {
    if (!detection.detected || !detection.span) {
      return {
        totalConfidence: 0.0,
        matchScore: 0.0,
        positionBonus: 0.0,
        qualityScore: 0.0,
        languageAlignmentScore: 1.0,
        intentPenalty: 0.0,
      };
    }

    const span = detection.span;
    const raw = context.originalQuery.trim();

    if ((detection.category as string) === 'Emoji' || context.emojiMetadata.isEmojiOnly) {
      return {
        totalConfidence: 1.0,
        matchScore: 1.0,
        positionBonus: 0.0,
        qualityScore: 1.0,
        languageAlignmentScore: 1.0,
        intentPenalty: 0.0,
      };
    }

    // 1. Base Match Score
    let matchScore = GREETING_CONFIDENCE_WEIGHTS.NORMALIZED_MATCH;
    if (span.matchedText.toLowerCase() === raw.toLowerCase()) {
      matchScore = GREETING_CONFIDENCE_WEIGHTS.EXACT_MATCH;
    } else if (detection.category === 'Emoji') {
      matchScore = GREETING_CONFIDENCE_WEIGHTS.EMOJI_MATCH;
    }

    // 2. Position Weight
    let positionBonus = 0.0;
    switch (span.position) {
      case 'Standalone':
        positionBonus = GREETING_CONFIDENCE_WEIGHTS.STANDALONE_BONUS;
        break;
      case 'Beginning':
        positionBonus = 0.0; // Clear beginning bonus for full score
        break;
      case 'End':
        positionBonus = GREETING_CONFIDENCE_WEIGHTS.END_PENALTY;
        break;
      case 'Middle':
        positionBonus = GREETING_CONFIDENCE_WEIGHTS.MIDDLE_PENALTY;
        break;
    }

    // 3. Quality & Token Length Score
    let qualityScore = 1.0;
    if (detection.category === 'Emoji') {
      qualityScore = 1.0;
    } else if (span.matchedText.length === 1 && !context.emojiMetadata.isEmojiOnly) {
      qualityScore = 0.8;
    }

    // 4. Language Alignment Score
    const languageAlignmentScore = (detection.confidence === 1.0) ? 1.0 : (context.languageConfidence || 1.0);

    // 5. Competing Intent Penalty (slight reduction for residual query, but minimum threshold 0.80)
    const intentPenalty = detection.hasBusinessIntent ? -0.05 : 0.0;

    // Aggregate Score
    let rawTotal = matchScore + positionBonus + intentPenalty;
    rawTotal *= qualityScore * languageAlignmentScore;

    if (detection.detected) {
      rawTotal = Math.max(rawTotal, 0.95);
    }

    // Clamp between 0.0 and 1.0
    const totalConfidence = Math.max(0.0, Math.min(1.0, Math.round(rawTotal * 100) / 100));

    return {
      totalConfidence,
      matchScore,
      positionBonus,
      qualityScore,
      languageAlignmentScore,
      intentPenalty,
    };
  }
}
