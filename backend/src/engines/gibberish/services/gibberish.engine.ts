import { IEngine, EngineResult } from '../../../shared/interfaces/engine.interface';
import { ProcessingContext } from '../../../normalization/types/processing-context.types';
import { GibberishPayload } from '../types/gibberish.types';
import { GibberishConfig, DEFAULT_GIBBERISH_CONFIG, GIBBERISH_ENGINE_NAME } from '../config/gibberish.config';
import { GibberishAnalyzer } from '../analyzer/gibberish.analyzer';
import { GibberishResponseGenerator } from '../responses/gibberish.response.generator';
import { TelemetryService } from '../../../shared/telemetry/telemetry.service';

export class GibberishEngine implements IEngine<EngineResult<GibberishPayload>> {
  public readonly name = GIBBERISH_ENGINE_NAME;

  private readonly config: GibberishConfig;
  private readonly analyzer: GibberishAnalyzer;

  constructor(config?: Partial<GibberishConfig>, analyzer?: GibberishAnalyzer) {
    this.config = { ...DEFAULT_GIBBERISH_CONFIG, ...config };
    this.analyzer = analyzer || new GibberishAnalyzer(this.config);
  }

  public process(context: ProcessingContext, _sessionId?: string): EngineResult<GibberishPayload> {
    const startTime = TelemetryService.startTimer();

    // Analyze normalized payload context
    const gibberishPayload = this.analyzer.analyze(context);

    // Populate gibberishMetadata in ProcessingContext for downstream engines
    (context as any).gibberishMetadata = gibberishPayload;

    const latencyMs = TelemetryService.getElapsedMs(startTime);
    const responseCandidate = gibberishPayload.isGibberish
      ? GibberishResponseGenerator.generateResponse(gibberishPayload.matchedReason)
      : undefined;

    return {
      engineName: this.name,
      handled: gibberishPayload.isGibberish,
      confidence: gibberishPayload.overallConfidence,
      intent: gibberishPayload.isGibberish ? 'GIBBERISH_REJECT' : undefined,
      category: gibberishPayload.matchedReason,
      responseCandidate,
      payload: gibberishPayload,
      residualContext: context,
      metadata: {
        latencyMs: Math.round(latencyMs * 100) / 100,
        isGibberish: gibberishPayload.isGibberish,
        matchedReason: gibberishPayload.matchedReason,
        falsePositiveBypassed: gibberishPayload.falsePositiveCheck.isBypassed,
        detectorScores: gibberishPayload.detectorScores,
      },
    };
  }
}
