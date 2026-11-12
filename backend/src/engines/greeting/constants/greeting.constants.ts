export const GREETING_ENGINE_NAME = 'GreetingEngine';

export const GREETING_CONFIDENCE_WEIGHTS = {
  EXACT_MATCH: 1.0,
  NORMALIZED_MATCH: 0.95,
  ALIAS_MATCH: 0.90,
  EMOJI_MATCH: 1.0,
  TIME_BASED_MATCH: 0.95,
  STANDALONE_BONUS: 0.0,
  BEGINNING_BONUS: -0.02,
  MIDDLE_PENALTY: -0.15,
  END_PENALTY: -0.10,
  COMPETING_INTENT_PENALTY: -0.10,
};

export const DEFAULT_GREETING_CONFIG = {
  confidenceThreshold: 0.70,
  maxGreetingTokenLength: 4,
  sessionInactivityTimeoutMs: 30 * 60 * 1000, // 30 minutes
};
