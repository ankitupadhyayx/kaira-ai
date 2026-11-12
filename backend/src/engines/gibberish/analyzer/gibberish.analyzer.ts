import { ProcessingContext } from '../../../normalization/types/processing-context.types';
import { GibberishPayload, DetectorResult } from '../types/gibberish.types';
import { GibberishConfig } from '../config/gibberish.config';
import { DetectorRegistry } from '../detectors/detector-registry/detector.registry';
import { FalsePositiveEvaluator } from '../false-positive/false-positive.evaluator';
import { ConfidenceEngine } from '../confidence/confidence.engine';
import { GibberishRuleEvaluator } from '../rules/gibberish.rules';
import { GibberishTelemetry } from '../telemetry/gibberish.telemetry';
import { TelemetryService } from '../../../shared/telemetry/telemetry.service';

export class GibberishAnalyzer {
  private readonly config: GibberishConfig;
  private readonly registry: DetectorRegistry;
  private readonly falsePositiveEvaluator: FalsePositiveEvaluator;
  private readonly confidenceEngine: ConfidenceEngine;

  constructor(
    config: GibberishConfig,
    registry?: DetectorRegistry,
    falsePositiveEvaluator?: FalsePositiveEvaluator,
    confidenceEngine?: ConfidenceEngine
  ) {
    this.config = config;
    this.registry = registry || new DetectorRegistry(config.whitelistedTechnicalTerms);
    this.falsePositiveEvaluator = falsePositiveEvaluator || new FalsePositiveEvaluator(config);
    this.confidenceEngine = confidenceEngine || new ConfidenceEngine(config);
  }

  public analyze(context: ProcessingContext): GibberishPayload {
    const startTime = TelemetryService.startTimer();

    // 1. False Positive Protection Check
    const fpCheck = this.falsePositiveEvaluator.evaluate(context);
    if (fpCheck.isBypassed) {
      const elapsedMs = TelemetryService.getElapsedMs(startTime);
      const result = GibberishRuleEvaluator.applyRules(
        {
          overallConfidence: 0.0,
          isGibberish: false,
          primaryReason: fpCheck.reason === 'WHITE_LISTED_TERM' ? 'WHITE_LISTED_TERM' : 'SHORT_INPUT',
          reasons: [],
          evidence: [],
          detectorScores: {},
        },
        fpCheck,
        elapsedMs,
        this.config,
        context
      );
      GibberishTelemetry.logExecution(result, context.originalQuery, elapsedMs);
      return result;
    }

    // 2. Execute all registered detectors
    const detectors = this.registry.getAllDetectors();
    const detectorResults: DetectorResult[] = [];

    for (const detector of detectors) {
      const res = detector.detect(context);
      detectorResults.push(res);
    }

    // 3. Compute confidence score & aggregated evidence
    const calcResult = this.confidenceEngine.calculate(detectorResults);

    // 4. Apply rules and build final GibberishPayload
    const elapsedMs = TelemetryService.getElapsedMs(startTime);
    const payload = GibberishRuleEvaluator.applyRules(calcResult, fpCheck, elapsedMs, this.config, context);

    GibberishTelemetry.logExecution(payload, context.originalQuery, elapsedMs);
    return payload;
  }
}
