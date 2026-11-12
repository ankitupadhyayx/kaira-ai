import { EngineResult } from '../../shared/interfaces/engine.interface';

export class ConfidenceArbitrator {
  public normalizeConfidence(result: EngineResult<any>): number {
    if (typeof result.confidence !== 'number' || isNaN(result.confidence)) {
      return 0.0;
    }
    return Math.min(1.0, Math.max(0.0, Math.round(result.confidence * 100) / 100));
  }

  public compareConfidence(a: EngineResult<any>, b: EngineResult<any>): number {
    const scoreA = this.normalizeConfidence(a);
    const scoreB = this.normalizeConfidence(b);
    return scoreB - scoreA;
  }
}
