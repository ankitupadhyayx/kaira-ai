/**
 * Retrieval Chunk Validation Quality Gate Tests
 *
 * Validates that:
 * - Generic overview chunks are REJECTED for specific topic queries
 * - Specific technology/service chunks are ACCEPTED
 * - NO_CONTEXT is triggered when no valid specific chunk exists
 * - Topic verification map covers all major domains
 */

import { retrievalQueryNormalizer, TOPIC_VERIFICATION_MAP } from '../../../src/retrieval/services/retrieval-query.normalizer';
import { rankingService } from '../../../src/retrieval/services/ranking.service';
import { ScoredChunkCandidate } from '../../../src/retrieval/types/retrieval.types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeChunk(
  overrides: Partial<ScoredChunkCandidate> & { content: string; heading?: string }
): ScoredChunkCandidate {
  return {
    chunk_id: `chunk_test_${Math.random().toString(36).slice(2)}`,
    document_id: 'doc_test_001',
    chunk_index: 0,
    page_number: 1,
    section: overrides.heading || 'General',
    heading: overrides.heading || 'General',
    similarityScore: overrides.similarityScore ?? 0.82,
    distance: 0.18,
    metadata: {
      title: overrides.metadata?.title || 'Test Document',
      department: overrides.metadata?.department || 'Engineering',
      language: 'en',
      visibility: 'Internal',
    },
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. TOPIC_VERIFICATION_MAP Coverage
// ─────────────────────────────────────────────────────────────────────────────

describe('1. TOPIC_VERIFICATION_MAP — Coverage', () => {
  const requiredTopics = [
    'web development', 'app development', 'mobile development',
    'artificial intelligence', 'machine learning', 'generative ai',
    'blockchain', 'smart contract', 'web3',
    'cloud', 'devops', 'docker', 'kubernetes',
    'security', 'compliance',
    'healthcare', 'fintech', 'ecommerce', 'logistics',
    'careers', 'internship', 'hiring',
    'leave', 'holiday', 'salary', 'insurance',
    'frontend', 'backend',
    'android', 'ios', 'flutter', 'react native',
  ];

  requiredTopics.forEach((topic) => {
    it(`should have topic entry for "${topic}"`, () => {
      expect(TOPIC_VERIFICATION_MAP[topic]).toBeDefined();
      expect(Array.isArray(TOPIC_VERIFICATION_MAP[topic])).toBe(true);
      expect(TOPIC_VERIFICATION_MAP[topic].length).toBeGreaterThan(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. extractTopicKeywords — Correct keyword extraction per query intent
// ─────────────────────────────────────────────────────────────────────────────

describe('2. extractTopicKeywords — Intent-to-Keyword Resolution', () => {
  it('extracts web development keywords for "web development" query', () => {
    const kws = retrievalQueryNormalizer.extractTopicKeywords('web development');
    expect(kws).toContain('react');
    expect(kws).toContain('frontend');
    expect(kws).toContain('backend');
  });

  it('extracts mobile keywords for "app development" query', () => {
    const kws = retrievalQueryNormalizer.extractTopicKeywords('app development');
    expect(kws).toContain('android');
    expect(kws).toContain('ios');
    expect(kws).toContain('flutter');
  });

  it('extracts android-specific keywords for "android development"', () => {
    const kws = retrievalQueryNormalizer.extractTopicKeywords('android development');
    expect(kws).toContain('android');
  });

  it('extracts blockchain keywords for "blockchain solutions"', () => {
    const kws = retrievalQueryNormalizer.extractTopicKeywords('blockchain solutions');
    expect(kws).toContain('smart contract');
    expect(kws).toContain('ethereum');
  });

  it('extracts cloud keywords for "cloud infrastructure"', () => {
    const kws = retrievalQueryNormalizer.extractTopicKeywords('cloud infrastructure');
    expect(kws).toContain('aws');
    expect(kws).toContain('azure');
  });

  it('extracts devops keywords for "devops pipeline"', () => {
    const kws = retrievalQueryNormalizer.extractTopicKeywords('devops pipeline');
    expect(kws).toContain('ci/cd');
    expect(kws).toContain('docker');
  });

  it('extracts leave keywords for "leave policy"', () => {
    const kws = retrievalQueryNormalizer.extractTopicKeywords('leave policy');
    expect(kws).toContain('leave');
  });

  it('extracts AI keywords for "ai development"', () => {
    const kws = retrievalQueryNormalizer.extractTopicKeywords('ai development');
    expect(kws).toContain('ai');
    expect(kws).toContain('llm');
  });

  it('uses longest match first (react native before react)', () => {
    const kws = retrievalQueryNormalizer.extractTopicKeywords('react native app');
    expect(kws).toContain('ios');
    expect(kws).toContain('android');
  });

  it('returns fallback tokens for unrecognized queries', () => {
    const kws = retrievalQueryNormalizer.extractTopicKeywords('some unknown query thing');
    expect(Array.isArray(kws)).toBe(true);
    expect(kws.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. RankingService — Generic Chunk Rejection (Core Quality Gate)
// ─────────────────────────────────────────────────────────────────────────────

describe('3. RankingService — Generic Overview Chunk Rejection', () => {
  it('REJECTS company overview chunk when user asks about web development', () => {
    const companyOverviewChunk = makeChunk({
      content: 'Mobiloitte is a company overview page. Core services overview. About Mobiloitte — digital transformation company.',
      heading: 'Company Overview',
      similarityScore: 0.84,
    });

    const { ranked } = rankingService.rankCandidates([companyOverviewChunk], undefined, undefined, 'web development react next.js frontend');
    expect(ranked.length).toBe(0); // Must be REJECTED
  });

  it('REJECTS "core services overview" chunk when user asks about android', () => {
    const genericServiceChunk = makeChunk({
      content: 'Mobiloitte core services overview. We offer AI, Mobile, Web, Cloud, and Blockchain development.',
      heading: 'Core Services Overview',
      similarityScore: 0.82,
    });

    const { ranked } = rankingService.rankCandidates([genericServiceChunk], undefined, undefined, 'android development kotlin');
    expect(ranked.length).toBe(0);
  });

  it('REJECTS "company profile" generic chunk for flutter query', () => {
    const genericChunk = makeChunk({
      content: 'Company profile overview. Founded in 2004. 500+ engineers. Mobiloitte company facts.',
      heading: 'Company Profile',
      similarityScore: 0.83,
    });

    const { ranked } = rankingService.rankCandidates([genericChunk], undefined, undefined, 'flutter cross-platform mobile');
    expect(ranked.length).toBe(0);
  });

  it('ACCEPTS web engineering specific chunk when user asks about web development', () => {
    const webChunk = makeChunk({
      content: 'Mobiloitte builds React and Next.js web applications. Frontend engineering with TypeScript and Node.js backend. REST and GraphQL APIs.',
      heading: 'Web Application Engineering',
      similarityScore: 0.87,
    });

    const { ranked } = rankingService.rankCandidates([webChunk], undefined, undefined, 'web development react next.js');
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0].heading).toContain('Web Application');
  });

  it('ACCEPTS Android-specific chunk when user asks about app development', () => {
    const androidChunk = makeChunk({
      content: 'Native Android development using Kotlin. Jetpack Compose, MVVM architecture, Play Store deployment, Firebase integration.',
      heading: 'Android Development',
      similarityScore: 0.86,
    });

    const { ranked } = rankingService.rankCandidates([androidChunk], undefined, undefined, 'android app development kotlin');
    expect(ranked.length).toBeGreaterThan(0);
  });

  it('ACCEPTS Flutter cross-platform chunk for flutter query', () => {
    const flutterChunk = makeChunk({
      content: 'Flutter cross-platform development for iOS and Android from a single codebase using Dart.',
      heading: 'Flutter Mobile Development',
      similarityScore: 0.88,
    });

    const { ranked } = rankingService.rankCandidates([flutterChunk], undefined, undefined, 'flutter dart cross-platform');
    expect(ranked.length).toBeGreaterThan(0);
  });

  it('ACCEPTS blockchain smart contract chunk for blockchain query', () => {
    const blockchainChunk = makeChunk({
      content: 'Smart contract development in Solidity. Ethereum and Polygon deployment, ERC-20, ERC-721 token standards, DeFi protocols.',
      heading: 'Blockchain Smart Contracts',
      similarityScore: 0.87,
    });

    const { ranked } = rankingService.rankCandidates([blockchainChunk], undefined, undefined, 'blockchain smart contract ethereum');
    expect(ranked.length).toBeGreaterThan(0);
  });

  it('ACCEPTS cloud infrastructure chunk for cloud query', () => {
    const cloudChunk = makeChunk({
      content: 'AWS cloud infrastructure. EC2, S3, Lambda, RDS. Azure and GCP multi-cloud architectures. Serverless and Kubernetes deployments.',
      heading: 'Cloud Infrastructure',
      similarityScore: 0.86,
    });

    const { ranked } = rankingService.rankCandidates([cloudChunk], undefined, undefined, 'cloud aws azure infrastructure');
    expect(ranked.length).toBeGreaterThan(0);
  });

  it('preferential ACCEPT: specific chunk beats generic chunk for same query', () => {
    const genericChunk = makeChunk({
      content: 'Mobiloitte company overview and core services overview. About Mobiloitte capabilities.',
      heading: 'Company Overview',
      similarityScore: 0.85,
    });

    const specificChunk = makeChunk({
      content: 'DevOps CI/CD pipeline with Jenkins, GitHub Actions, Docker, and Kubernetes. Terraform for infrastructure as code.',
      heading: 'DevOps & CI/CD Pipeline',
      similarityScore: 0.83,
      document_id: 'doc_devops_001',
    });

    const { ranked } = rankingService.rankCandidates(
      [genericChunk, specificChunk],
      undefined, undefined,
      'devops ci/cd kubernetes docker pipeline'
    );

    // Specific chunk should beat generic chunk
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0].heading).not.toContain('Company Overview');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. NO_CONTEXT Guarantee: No Generic Chunks Reach Gemini
// ─────────────────────────────────────────────────────────────────────────────

describe('4. NO_CONTEXT Guarantee — Only Specific Chunks Pass to Gemini', () => {
  it('returns empty ranked result (NO_CONTEXT signal) when only generic chunks exist for specific tech query', () => {
    const allGenericChunks = [
      makeChunk({ content: 'Mobiloitte overview. Company profile. All services summary.', heading: 'Company Overview', similarityScore: 0.84 }),
      makeChunk({ content: 'Core services overview. We provide AI, Mobile, Web, Blockchain.', heading: 'Core Services Overview', similarityScore: 0.82 }),
      makeChunk({ content: 'Company facts and figures. Founded 2004. 500+ engineers.', heading: 'Company Facts', similarityScore: 0.81 }),
    ];

    const { ranked } = rankingService.rankCandidates(
      allGenericChunks,
      undefined, undefined,
      'react next.js frontend web development'
    );

    expect(ranked.length).toBe(0);
  });

  it('returns empty ranked result when only generic chunks exist for ios query', () => {
    const allGenericChunks = [
      makeChunk({ content: 'Mobiloitte company overview. Digital transformation company.', heading: 'About Mobiloitte', similarityScore: 0.83 }),
      makeChunk({ content: 'Service portfolio overview. Mobile, Web, AI, Cloud solutions.', heading: 'Service Portfolio', similarityScore: 0.81 }),
    ];

    const { ranked } = rankingService.rankCandidates(
      allGenericChunks,
      undefined, undefined,
      'ios swift xcode app development'
    );

    expect(ranked.length).toBe(0);
  });
});
