export interface IFeatureFlagManager {
  isEnabled(flagKey: string, context?: Record<string, unknown>): boolean;
  getAllFlags(): Record<string, boolean>;
  setFlag(flagKey: string, enabled: boolean): void;
}
