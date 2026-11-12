import { retrievalQueryNormalizer } from '../../../src/retrieval/services/retrieval-query.normalizer';
import { queryIntelligenceService } from '../../../src/retrieval/services/query-intelligence.service';
import { rankingService } from '../../../src/retrieval/services/ranking.service';
import { ScoredChunkCandidate } from '../../../src/retrieval/types/retrieval.types';

describe('Enterprise Retrieval Precision & Architecture Suite', () => {
  it('strips accents and normalizes unicode NFD', () => {
    const clean = retrievalQueryNormalizer.normalizeForRetrieval('médical insúrance résumé');
    expect(clean).toContain('medical');
    expect(clean).toContain('insurance');
  });

  it('expands enterprise dictionary acronyms and technical terms', () => {
    const clean = retrievalQueryNormalizer.normalizeForRetrieval('gen ai ci cd react native');
    expect(clean).toContain('generative artificial intelligence');
    expect(clean).toContain('continuous integration continuous delivery');
    expect(clean).toContain('react native mobile development');
  });

  it('enforces Intent-First priority over entity detection ("love you mobiloitte" -> Appreciation)', () => {
    const intelAppreciation = queryIntelligenceService.analyzeQuery('love you mobiloitte');
    expect(intelAppreciation.intent).toBe('Appreciation');

    const intelThanks = queryIntelligenceService.analyzeQuery('thank you mobiloitte');
    expect(intelThanks.intent).toBe('Thanks');

    const intelGreeting = queryIntelligenceService.analyzeQuery('good morning mobiloitte');
    expect(intelGreeting.intent).toBe('Greeting');
  });

  it('enforces Mandatory Dual-Validation Gate (rejects unrelated policy chunks lacking secondary match)', () => {
    const candidateChunks: ScoredChunkCandidate[] = [
      {
        chunk_id: 'chunk_holiday_1',
        document_id: 'doc_holiday_policy',
        chunk_index: 0,
        page_number: 1,
        section: 'Holiday Policy',
        heading: 'Annual Holiday List',
        content: 'Mobiloitte observes 12 gazetted public holidays per annual calendar year.',
        similarityScore: 0.82,
        distance: 0.18,
        metadata: { title: 'Holiday Policy', department: 'HR' },
      },
      {
        chunk_id: 'chunk_privacy_1',
        document_id: 'doc_privacy_policy',
        chunk_index: 0,
        page_number: 1,
        section: 'Data Privacy Policy',
        heading: 'GDPR Compliance',
        content: 'Data Privacy Policy outlines data protection regulations and personal data encryption.',
        similarityScore: 0.76,
        distance: 0.24,
        metadata: { title: 'Data Privacy Policy', department: 'Security' },
      },
    ];

    const { ranked } = rankingService.rankCandidates(
      candidateChunks,
      5,
      0.70,
      'public holiday policy'
    );

    expect(ranked.length).toBe(1);
    expect(ranked[0].document_id).toBe('doc_holiday_policy');
  });
});
