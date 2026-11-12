export interface SearchConfig {
  earlyTerminationThreshold: number;
  maxCandidates: number;
  enableFuzzyMatching: boolean;
  enablePhoneticMatching: boolean;
  enableNGramMatching: boolean;
  minWordLengthForFuzzy: number;
}

export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  earlyTerminationThreshold: 0.85,
  maxCandidates: 20,
  enableFuzzyMatching: true,
  enablePhoneticMatching: true,
  enableNGramMatching: true,
  minWordLengthForFuzzy: 3,
};
