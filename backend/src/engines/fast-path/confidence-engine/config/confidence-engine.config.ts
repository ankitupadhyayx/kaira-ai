export interface SignalWeights {
  aliasScore: number;
  synonymScore: number;
  entityScore: number;
  tokenScore: number;
  grammarScore: number;
  similarityScore: number;
  contextScore: number;
  normalizationScore: number;
  ambiguityPenalty: number;
}

export interface IConfidenceEngineConfig {
  enabled: boolean;
  weights: SignalWeights;
  excellentGradeThreshold: number;
  highGradeThreshold: number;
  moderateGradeThreshold: number;
  lowGradeThreshold: number;
}

export const DEFAULT_CONFIDENCE_ENGINE_CONFIG: IConfidenceEngineConfig = {
  enabled: true,
  weights: {
    aliasScore: 0.15,
    synonymScore: 0.10,
    entityScore: 0.20,
    tokenScore: 0.25,
    grammarScore: 0.05,
    similarityScore: 0.10,
    contextScore: 0.05,
    normalizationScore: 0.05,
    ambiguityPenalty: 0.15,
  },
  excellentGradeThreshold: 0.90,
  highGradeThreshold: 0.80,
  moderateGradeThreshold: 0.65,
  lowGradeThreshold: 0.50,
};
