export interface IFastPathAnalyticsConfig {
  enabled: boolean;
  maxTopItems: number;
}

export const DEFAULT_FAST_PATH_ANALYTICS_CONFIG: IFastPathAnalyticsConfig = {
  enabled: true,
  maxTopItems: 10,
};
