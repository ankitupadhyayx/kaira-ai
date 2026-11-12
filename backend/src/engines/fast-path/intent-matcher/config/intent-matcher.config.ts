export interface IIntentMatcherConfig {
  enabled: boolean;
  minWinningScoreThreshold: number;
  multiIntentGapThreshold: number;
  ambiguousGapThreshold: number;
}

export const DEFAULT_INTENT_MATCHER_CONFIG: IIntentMatcherConfig = {
  enabled: true,
  minWinningScoreThreshold: 0.65,
  multiIntentGapThreshold: 0.15,
  ambiguousGapThreshold: 0.10,
};
