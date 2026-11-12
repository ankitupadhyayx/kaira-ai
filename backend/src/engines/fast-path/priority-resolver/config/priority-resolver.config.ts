export interface IPriorityResolverConfig {
  enabled: boolean;
  rulesPath: string;
  minDisambiguationScoreGap: number;
}

export const DEFAULT_PRIORITY_RESOLVER_CONFIG: IPriorityResolverConfig = {
  enabled: true,
  rulesPath: 'src/knowledge/rules/disambiguation-rules.json',
  minDisambiguationScoreGap: 0.10,
};
