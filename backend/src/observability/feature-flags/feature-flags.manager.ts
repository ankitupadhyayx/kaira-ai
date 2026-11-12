import { appConfig } from '../../shared/config/app.config';
import { IFeatureFlagManager } from '../../shared/interfaces/feature-flag.interface';

export class FeatureFlagManager implements IFeatureFlagManager {
  private flags: Map<string, boolean> = new Map();

  constructor() {
    this.flags.set('fastPathEnabled', appConfig.featureFlags.fastPathEnabled);
    this.flags.set('gibberishDetectionEnabled', appConfig.featureFlags.gibberishDetectionEnabled);
  }

  public isEnabled(flagKey: string): boolean {
    return this.flags.get(flagKey) ?? false;
  }

  public getAllFlags(): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    for (const [key, value] of this.flags.entries()) {
      result[key] = value;
    }
    return result;
  }

  public setFlag(flagKey: string, enabled: boolean): void {
    this.flags.set(flagKey, enabled);
  }
}

export const featureFlagManager = new FeatureFlagManager();
