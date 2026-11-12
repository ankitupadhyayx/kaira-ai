import { DetectorResult, GibberishEvidence, GibberishReasonCode } from '../types/gibberish.types';
import { GibberishConfig, GibberishDetectorWeights } from '../config/gibberish.config';

export interface ConfidenceCalculationResult {
  overallConfidence: number;
  isGibberish: boolean;
  primaryReason: GibberishReasonCode;
  reasons: GibberishReasonCode[];
  evidence: GibberishEvidence[];
  detectorScores: Record<string, number>;
}

export class ConfidenceEngine {
  private readonly config: GibberishConfig;

  constructor(config: GibberishConfig) {
    this.config = config;
  }

  public calculate(results: DetectorResult[]): ConfidenceCalculationResult {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    const evidence: GibberishEvidence[] = [];
    const detectorScores: Record<string, number> = {};
    const reasonsSet = new Set<GibberishReasonCode>();

    let maxSingleDetectorScore = 0;
    let maxSingleDetectorReason: GibberishReasonCode = 'NORMAL_TEXT';

    const weights = this.config.weights;

    for (const result of results) {
      const weight = this.getWeightForDetector(result.detectorName, weights);
      const score = result.score;
      const confidence = result.confidence;
      const combined = score * confidence;

      detectorScores[result.detectorName] = Math.round(score * 100) / 100;

      if (score > 0) {
        totalWeightedScore += combined * weight;
        totalWeight += weight;

        evidence.push({
          detectorName: result.detectorName,
          score,
          confidence,
          reason: result.matchedReason,
          details: result.metadata,
        });

        reasonsSet.add(result.matchedReason);

        if (combined > maxSingleDetectorScore) {
          maxSingleDetectorScore = combined;
          maxSingleDetectorReason = result.matchedReason;
        }
      }
    }

    // Normalized overall confidence
    let overallConfidence = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    // High single-detector signal (e.g. keyboard mash, random char, symbol noise, unknown ratio) boosts overall confidence
    if (maxSingleDetectorScore >= 0.70) {
      overallConfidence = Math.max(overallConfidence, maxSingleDetectorScore);
    }

    const isGibberish = overallConfidence >= this.config.gibberishConfidenceThreshold;
    const primaryReason = isGibberish ? maxSingleDetectorReason : 'NORMAL_TEXT';

    return {
      overallConfidence: Math.min(1.0, Math.round(overallConfidence * 100) / 100),
      isGibberish,
      primaryReason,
      reasons: Array.from(reasonsSet),
      evidence,
      detectorScores,
    };
  }

  private getWeightForDetector(detectorName: string, weights: GibberishDetectorWeights): number {
    switch (detectorName) {
      case 'SECURITY_INJECTION_DETECTOR':
      case 'SecurityInjectionDetector':
        return 0.35;
      case 'KEYBOARD_MASH_DETECTOR':
      case 'KeyboardMashDetector':
        return weights.keyboardMash ?? 0.25;
      case 'RANDOM_CHARACTER_DETECTOR':
      case 'RandomCharacterDetector':
        return weights.randomCharacter ?? 0.20;
      case 'URL_SPAM_DETECTOR':
      case 'UrlSpamDetector':
        return 0.20;
      case 'RANDOM_NUMBER_DETECTOR':
      case 'RandomNumberDetector':
        return 0.20;
      case 'REPEATED_CHARACTER_DETECTOR':
      case 'RepeatedCharacterDetector':
        return weights.repeatedCharacter ?? 0.15;
      case 'NOISE_DETECTOR':
      case 'NoiseDetector':
        return weights.noise ?? 0.15;
      case 'UNKNOWN_TOKEN_RATIO_DETECTOR':
      case 'UnknownTokenRatioDetector':
        return weights.unknownToken ?? 0.15;
      case 'EMOJI_SPAM_DETECTOR':
      case 'EmojiSpamDetector':
        return weights.emojiSpam ?? 0.15;
      case 'MIXED_SCRIPT_DETECTOR':
      case 'MixedScriptDetector':
        return weights.mixedScript ?? 0.05;
      case 'LOW_ENTROPY_DETECTOR':
      case 'LowEntropyDetector':
        return weights.lowEntropy ?? 0.05;
      default:
        return 0.10;
    }
  }
}
