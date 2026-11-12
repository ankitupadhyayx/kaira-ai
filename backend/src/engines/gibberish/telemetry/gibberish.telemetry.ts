import { logger } from '../../../shared/logging/logger.service';
import { TelemetryService } from '../../../shared/telemetry/telemetry.service';
import { GibberishPayload } from '../types/gibberish.types';

export class GibberishTelemetry {
  private static totalProcessed = 0;
  private static totalGibberishDetected = 0;
  private static totalFalsePositivesBypassed = 0;
  private static totalLatencyMs = 0;
  private static totalConfidenceSum = 0;

  public static logExecution(payload: GibberishPayload, query: string, latencyMs: number): void {
    GibberishTelemetry.totalProcessed++;
    GibberishTelemetry.totalLatencyMs += latencyMs;
    GibberishTelemetry.totalConfidenceSum += payload.overallConfidence;

    if (payload.isGibberish) {
      GibberishTelemetry.totalGibberishDetected++;
    }

    if (payload.falsePositiveCheck.isBypassed) {
      GibberishTelemetry.totalFalsePositivesBypassed++;
    }

    logger.debug('[GibberishEngine] Evaluation finished', {
      query,
      isGibberish: payload.isGibberish,
      overallConfidence: payload.overallConfidence,
      matchedReason: payload.matchedReason,
      falsePositiveBypassed: payload.falsePositiveCheck.isBypassed,
      latencyMs,
      detectorScores: payload.detectorScores,
    });
  }

  public static getMetrics(): {
    totalProcessed: number;
    totalGibberishDetected: number;
    totalFalsePositivesBypassed: number;
    avgConfidence: number;
    avgLatencyMs: number;
  } {
    const total = Math.max(1, GibberishTelemetry.totalProcessed);
    return {
      totalProcessed: GibberishTelemetry.totalProcessed,
      totalGibberishDetected: GibberishTelemetry.totalGibberishDetected,
      totalFalsePositivesBypassed: GibberishTelemetry.totalFalsePositivesBypassed,
      avgConfidence: Math.round((GibberishTelemetry.totalConfidenceSum / total) * 100) / 100,
      avgLatencyMs: Math.round((GibberishTelemetry.totalLatencyMs / total) * 100) / 100,
    };
  }

  public static resetMetrics(): void {
    GibberishTelemetry.totalProcessed = 0;
    GibberishTelemetry.totalGibberishDetected = 0;
    GibberishTelemetry.totalFalsePositivesBypassed = 0;
    GibberishTelemetry.totalLatencyMs = 0;
    GibberishTelemetry.totalConfidenceSum = 0;
  }
}
