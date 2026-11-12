import { EnterpriseFastPathAnalytics } from '../../../../../src/engines/fast-path/analytics/services/enterprise-fast-path.analytics';

describe('EnterpriseFastPathAnalytics (Stage 6.10)', () => {
  let analytics: EnterpriseFastPathAnalytics;

  beforeEach(() => {
    analytics = new EnterpriseFastPathAnalytics();
  });

  test('should record matched intents and compute telemetry metrics', () => {
    analytics.recordMatch({
      intentId: 'LEADERSHIP.CEO',
      confidence: 0.95,
      latencyMs: 12,
      aliases: [
        { originalTerm: 'ceo', resolvedTerm: 'chief executive officer', datasetId: 'aliases', confidence: 1.0, applied: true },
      ],
      entities: [
        {
          entityId: 'ENT_LEAD_CEO',
          type: 'leadership',
          name: 'Mr. Jagdish Harsh',
          canonical: 'jagdish harsh',
          matchedText: 'ceo',
          startIndex: 0,
          endIndex: 3,
          confidence: 1.0,
          attributes: { category: 'executive' },
        },
      ],
    });

    const snapshot = analytics.getSnapshot();
    expect(snapshot.totalProcessedQueries).toBe(1);
    expect(snapshot.matchedIntentsCount).toBe(1);
    expect(snapshot.matchedIntentsBreakdown['LEADERSHIP.CEO']).toBe(1);
    expect(snapshot.confidenceDistribution.excellent).toBe(1);
    expect(snapshot.topAliases[0].term).toBe('chief executive officer');
    expect(snapshot.entityCoverage['leadership']).toBe(1);
    expect(snapshot.latency.minLatencyMs).toBe(12);
  });

  test('should record failed intents and unknown entities', () => {
    analytics.recordMiss({
      query: 'random unhandled text',
      latencyMs: 8,
      failedAliases: ['unhandled_alias'],
      unknownEntities: ['quantum_core'],
    });

    const snapshot = analytics.getSnapshot();
    expect(snapshot.failedIntentsCount).toBe(1);
    expect(snapshot.topFailedAliases[0].term).toBe('unhandled_alias');
    expect(snapshot.unknownEntities[0].term).toBe('quantum_core');
    expect(snapshot.confidenceDistribution.veryLow).toBe(1);
  });

  test('should record clarifications and fallbacks', () => {
    analytics.recordClarification('java query', ['COMPANY_PROFILE', 'INTERNSHIPS'], 15);
    analytics.recordFallback('fallback query', 25);

    const snapshot = analytics.getSnapshot();
    expect(snapshot.clarificationsCount).toBe(1);
    expect(snapshot.fallbacksCount).toBe(1);
    expect(snapshot.confidenceDistribution.moderate).toBe(1);
    expect(snapshot.confidenceDistribution.low).toBe(1);
  });

  test('should reset telemetry snapshot cleanly', () => {
    analytics.recordMatch({ intentId: 'COMPANY_PROFILE', confidence: 0.88, latencyMs: 10 });
    analytics.reset();

    const snapshot = analytics.getSnapshot();
    expect(snapshot.totalProcessedQueries).toBe(0);
    expect(snapshot.matchedIntentsCount).toBe(0);
  });
});
