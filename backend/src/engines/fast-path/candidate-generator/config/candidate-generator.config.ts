export interface ICandidateGeneratorConfig {
  enabled: boolean;
  minCandidateScoreThreshold: number;
  maxCandidatesCount: number;
  entityMatchBonusWeight: number;
  aliasMatchBonusWeight: number;
}

export const DEFAULT_CANDIDATE_GENERATOR_CONFIG: ICandidateGeneratorConfig = {
  enabled: true,
  minCandidateScoreThreshold: 0.35,
  maxCandidatesCount: 10,
  entityMatchBonusWeight: 0.05,
  aliasMatchBonusWeight: 0.05,
};
