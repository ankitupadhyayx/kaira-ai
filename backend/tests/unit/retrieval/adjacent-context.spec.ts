import { retrievalService } from '../../../src/retrieval/services/retrieval.service';
import { rankingService } from '../../../src/retrieval/services/ranking.service';
import { contextBuilderService } from '../../../src/retrieval/services/context-builder.service';
import { similaritySearchService } from '../../../src/retrieval/services/similarity-search.service';
import { ScoredChunkCandidate } from '../../../src/retrieval/types/retrieval.types';

describe('Retrieval Engine — Anchor Chunk & Adjacent Context Execution Suite', () => {
  describe('1. Anchor Chunk & Adjacent Context Retrieval', () => {
    it('fetches previous (chunk_index - 1) and next (chunk_index + 1) chunks from the same document only', async () => {
      const anchor: ScoredChunkCandidate = {
        chunk_id: 'doc1_chunk1',
        document_id: 'doc_100',
        chunk_index: 1,
        page_number: 2,
        section: 'Mobile Architecture',
        heading: '2.1 CI/CD Pipelines',
        content: 'Anchor chunk content explaining mobile CI/CD pipelines.',
        similarityScore: 0.90,
        distance: 0.10,
        metadata: { title: 'Mobile Distribution Guide' },
      };

      const prev: ScoredChunkCandidate = {
        chunk_id: 'doc1_chunk0',
        document_id: 'doc_100',
        chunk_index: 0,
        page_number: 1,
        section: 'Mobile Architecture',
        heading: '1.0 Introduction',
        content: 'Previous chunk content setting up mobile architecture.',
        similarityScore: 0.75,
        distance: 0.25,
        metadata: { title: 'Mobile Distribution Guide' },
      };

      const next: ScoredChunkCandidate = {
        chunk_id: 'doc1_chunk2',
        document_id: 'doc_100',
        chunk_index: 2,
        page_number: 3,
        section: 'Mobile Architecture',
        heading: '3.0 Distribution Channels',
        content: 'Next chunk content describing App Store and Play Store distribution.',
        similarityScore: 0.78,
        distance: 0.22,
        metadata: { title: 'Mobile Distribution Guide' },
      };

      const merged = contextBuilderService.buildAnchorWithAdjacentContext(anchor, prev, next);

      expect(merged.length).toBe(3);
      // Must be ordered strictly by chunk_index ASC (0 -> 1 -> 2)
      expect(merged[0].chunk_index).toBe(0);
      expect(merged[1].chunk_index).toBe(1);
      expect(merged[2].chunk_index).toBe(2);
      expect(merged[0].chunk_id).toBe('doc1_chunk0');
      expect(merged[1].chunk_id).toBe('doc1_chunk1');
      expect(merged[2].chunk_id).toBe('doc1_chunk2');
    });

    it('prevents cross-document adjacent chunk retrieval', async () => {
      const anchor: ScoredChunkCandidate = {
        chunk_id: 'docA_chunk2',
        document_id: 'doc_A',
        chunk_index: 2,
        page_number: 1,
        section: 'Policy',
        heading: 'Leave Rules',
        content: 'Anchor leave policy rules content.',
        similarityScore: 0.92,
        distance: 0.08,
        metadata: { title: 'Leave SOP' },
      };

      const otherDocPrev: ScoredChunkCandidate = {
        chunk_id: 'docB_chunk1',
        document_id: 'doc_B', // Different document!
        chunk_index: 1,
        page_number: 1,
        section: 'Overview',
        heading: 'Company Profile',
        content: 'Generic company overview from document B.',
        similarityScore: 0.60,
        distance: 0.40,
        metadata: { title: 'Company Overview' },
      };

      const merged = contextBuilderService.buildAnchorWithAdjacentContext(anchor, otherDocPrev, undefined);

      expect(merged.length).toBe(1);
      expect(merged[0].document_id).toBe('doc_A');
      expect(merged[0].chunk_id).toBe('docA_chunk2');
    });
  });

  describe('2. Specific Query Generic Chunk Penalization', () => {
    it('penalizes generic company profile/overview chunks when user asks a specific technical question', () => {
      const candidates: ScoredChunkCandidate[] = [
        {
          chunk_id: 'c_generic',
          document_id: 'doc_overview',
          chunk_index: 0,
          page_number: 1,
          section: 'Company Overview',
          heading: 'Mobiloitte Company Overview',
          content: 'Mobiloitte is a premier software development firm founded in 2004 delivering digital transformation solutions.',
          similarityScore: 0.82,
          distance: 0.18,
          metadata: { title: 'Company Background' },
        },
        {
          chunk_id: 'c_specific',
          document_id: 'doc_devops',
          chunk_index: 4,
          page_number: 5,
          section: 'DevOps & CI/CD',
          heading: 'CI/CD Pipelines for Mobile App Distribution',
          content: 'Mobile distribution uses Fastlane and GitHub Actions to automate App Store and Play Store releases.',
          similarityScore: 0.80,
          distance: 0.20,
          metadata: { title: 'DevOps SOP' },
        },
      ];

      const { ranked } = rankingService.rankCandidates(
        candidates,
        5,
        0.50,
        'What CI/CD pipelines are used for mobile app distribution?'
      );

      expect(ranked.length).toBeGreaterThan(0);
      // Specific CI/CD chunk must rank higher than generic company overview
      expect(ranked[0].chunk_id).toBe('c_specific');
      expect(ranked[0].similarityScore).toBeGreaterThan(ranked[1]?.similarityScore || 0);
    });

    it('penalizes generic company overview when user asks about holiday policy', () => {
      const candidates: ScoredChunkCandidate[] = [
        {
          chunk_id: 'c_overview',
          document_id: 'doc_overview',
          chunk_index: 0,
          page_number: 1,
          section: 'Overview',
          heading: 'About Mobiloitte',
          content: 'About Mobiloitte company background and core services overview.',
          similarityScore: 0.81,
          distance: 0.19,
          metadata: { title: 'Mobiloitte Overview' },
        },
        {
          chunk_id: 'c_holiday',
          document_id: 'doc_hr',
          chunk_index: 2,
          page_number: 2,
          section: 'HR Governance',
          heading: 'Public Holiday List & Annual Calendar',
          content: 'The official public holiday list includes New Year, Republic Day, Independence Day, and Diwali.',
          similarityScore: 0.79,
          distance: 0.21,
          metadata: { title: 'HR Handbook' },
        },
      ];

      const { ranked } = rankingService.rankCandidates(
        candidates,
        5,
        0.50,
        'holiday policy'
      );

      expect(ranked[0].chunk_id).toBe('c_holiday');
    });
  });

  describe('3. Threshold Guard & NO_CONTEXT_FOUND', () => {
    it('returns empty ranked array when no candidate meets similarity threshold', () => {
      const weakCandidates: ScoredChunkCandidate[] = [
        {
          chunk_id: 'c_weak',
          document_id: 'doc_unrelated',
          chunk_index: 0,
          page_number: 1,
          section: 'Unrelated',
          heading: 'Irrelevant Topic',
          content: 'Completely unrelated text about gardening.',
          similarityScore: 0.35,
          distance: 0.65,
          metadata: { title: 'Unrelated Doc' },
        },
      ];

      const { ranked } = rankingService.rankCandidates(weakCandidates, 5, 0.70, 'leave policy');
      expect(ranked.length).toBe(0);
    });
  });
});
