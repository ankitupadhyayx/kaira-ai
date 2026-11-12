import { IEngine, EngineResult } from '../../../shared/interfaces/engine.interface';
import { ProcessingContext } from '../../../normalization/types/processing-context.types';
import { GreetingPayload, UserPersona } from '../types/greeting.types';
import { GREETING_ENGINE_NAME } from '../constants/greeting.constants';

import { GreetingDetector } from '../detector/greeting.detector';
import { GreetingClassifier } from '../classifier/greeting.classifier';
import { GreetingConfidenceCalculator } from '../confidence/greeting.confidence';
import { GreetingSplitter } from '../splitter/greeting.splitter';
import { GreetingSessionManager, greetingSessionManager } from '../session-awareness/greeting.session.manager';
import { GreetingResponseStrategy } from '../responses/greeting-response.strategy';
import { GreetingUnderstandingLayer, greetingUnderstandingLayer } from '../understanding/greeting.understanding';
import { GreetingAnalytics, greetingAnalytics } from '../analytics/greeting.analytics';

export class GreetingEngine implements IEngine<EngineResult<GreetingPayload>> {
  public readonly name = GREETING_ENGINE_NAME;

  private readonly detector: GreetingDetector;
  private readonly classifier: GreetingClassifier;
  private readonly confidenceCalculator: GreetingConfidenceCalculator;
  private readonly splitter: GreetingSplitter;
  private readonly sessionManager: GreetingSessionManager;
  private readonly responseStrategy: GreetingResponseStrategy;
  private readonly understandingLayer: GreetingUnderstandingLayer;
  private readonly analytics: GreetingAnalytics;

  constructor(
    detector?: GreetingDetector,
    classifier?: GreetingClassifier,
    confidenceCalculator?: GreetingConfidenceCalculator,
    splitter?: GreetingSplitter,
    sessionManager?: GreetingSessionManager,
    responseStrategy?: GreetingResponseStrategy,
    understandingLayer?: GreetingUnderstandingLayer,
    analytics?: GreetingAnalytics
  ) {
    this.detector = detector || new GreetingDetector();
    this.classifier = classifier || new GreetingClassifier();
    this.confidenceCalculator = confidenceCalculator || new GreetingConfidenceCalculator();
    this.splitter = splitter || new GreetingSplitter();
    this.sessionManager = sessionManager || greetingSessionManager;
    this.responseStrategy = responseStrategy || new GreetingResponseStrategy();
    this.understandingLayer = understandingLayer || greetingUnderstandingLayer;
    this.analytics = analytics || greetingAnalytics;
  }

  public process(context: ProcessingContext, sessionId?: string): EngineResult<GreetingPayload> {
    const startTime = process.hrtime.bigint();

    // 1. Detection Stage
    const detection = this.detector.detect(context);
    if (!detection.detected) {
      const endTime = process.hrtime.bigint();
      const latencyMs = Number(endTime - startTime) / 1_000_000;
      return {
        engineName: this.name,
        handled: false,
        confidence: 0.0,
        metadata: {
          latencyMs: Math.round(latencyMs * 100) / 100,
        },
      };
    }

    // 2. Classification Stage
    const category = this.classifier.classify(detection, context);

    // 3. Confidence Calculation Stage
    const confidenceScore = this.confidenceCalculator.calculate(detection, context);

    // 4. Greeting Understanding Layer (Language, Energy, Emotion, Formality, Politeness, Audience, Persona, Context)
    const understanding = this.understandingLayer.analyze(context, category, detection.span?.matchedText, detection);

    // 5. Splitting Stage (extract greeting span and residual context)
    const splitResult = this.splitter.split(detection, context);

    // 6. Session Memory Stage
    const activeSessionId = sessionId || 'anonymous-session';
    const isRepeated = this.sessionManager.isRepeatedGreeting(activeSessionId);
    const sessionState = this.sessionManager.recordGreeting(activeSessionId, category);

    // 7. Persona & Conversational Response Strategy Stage
    const persona: UserPersona = understanding.persona || 'Professional';
    const responseStrategyResult = this.responseStrategy.determineStrategy(
      category,
      detection.span?.matchedText,
      persona,
      sessionState.turnCount,
      activeSessionId,
      context,
      understanding
    );

    // 8. Telemetry & Analytics Stage
    const endTime = process.hrtime.bigint();
    const latencyMs = Number(endTime - startTime) / 1_000_000;

    this.analytics.record({
      sessionId: activeSessionId,
      greetingCategory: category,
      language: understanding.language,
      style: understanding.style,
      emotion: understanding.emotion,
      persona: understanding.persona,
      confidence: confidenceScore.totalConfidence,
      position: detection.span?.position || 'Standalone',
      hasBusinessQuery: detection.hasBusinessIntent,
      isRepeatedGreeting: isRepeated,
      latencyMs: Math.round(latencyMs * 100) / 100,
    });

    // Build final EngineResult payload
    const payload: GreetingPayload = {
      greetingDetected: true,
      matchedGreeting: detection.span?.matchedText,
      category,
      confidence: confidenceScore.totalConfidence,
      confidenceDetails: confidenceScore,
      position: detection.span?.position || 'Standalone',
      hasBusinessQuery: detection.hasBusinessIntent,
      residualQuery: splitResult.residualQuery,
      isRepeatedGreeting: isRepeated,
      persona,
      understanding,
      composition: responseStrategyResult.composition,
      recommendedResponseStrategy: responseStrategyResult,
      categories: detection.categories,
    };

    const formattedCandidate = responseStrategyResult.responseTemplate || 'Hello! 👋';

    let engineName = 'Greeting Engine';
    if (category === 'Farewell') engineName = 'Farewell Engine';
    else if (category === 'Thanks') engineName = 'Thanks Engine';
    else if (category === 'Help') engineName = 'Help Engine';
    else if (['Apology', 'Confirmation', 'Appreciation', 'Confusion'].includes(category)) {
      engineName = 'Acknowledgement Engine';
    }

    return {
      engineName,
      handled: true,
      confidence: confidenceScore.totalConfidence,
      intent: category.toUpperCase(),
      category,
      responseCandidate: formattedCandidate,
      payload,
      residualContext: splitResult.residualContext,
      metadata: {
        latencyMs: Math.round(latencyMs * 100) / 100,
        matchedText: detection.span?.matchedText,
        position: detection.span?.position,
        hasResidualIntent: detection.hasBusinessIntent,
        language: understanding.language,
        style: understanding.style,
        emotion: understanding.emotion,
        persona: understanding.persona,
      },
    };
  }
}
