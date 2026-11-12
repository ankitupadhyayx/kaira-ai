export interface IMultiIntentConfig {
  enabled: boolean;
  rulesPath: string;
  maxSegments: number;
}

export const DEFAULT_MULTI_INTENT_CONFIG: IMultiIntentConfig = {
  enabled: true,
  rulesPath: 'src/knowledge/rules/multi-intent-rules.json',
  maxSegments: 5,
};
