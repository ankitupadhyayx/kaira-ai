import request from 'supertest';
import { ExpressGateway } from '../../../src/ingestion/gateway/express.gateway';
import { embeddingService } from '../../../src/admin/services/embedding.service';

describe('Enterprise Embedding Pipeline — Isolated Unit Tests & Control APIs', () => {
  let app: any;

  beforeAll(() => {
    const gateway = new ExpressGateway();
    app = gateway.app;
  });

  describe('1. Embedding Service Enterprise Capabilities', () => {
    it('Validates 768-dimensional vector integrity correctly', () => {
      const validVector = new Array(768).fill(0.01);
      const invalidVectorDim = new Array(512).fill(0.01);
      const invalidVectorNaN = new Array(768).fill(NaN);

      expect(embeddingService.validateVector(validVector, 768)).toBe(true);
      expect(embeddingService.validateVector(invalidVectorDim, 768)).toBe(false);
      expect(embeddingService.validateVector(invalidVectorNaN, 768)).toBe(false);
    });

    it('Generates SHA256 content checksums for deduplication', () => {
      const checksum1 = embeddingService.generateContentChecksum('Chunk content payload 1', 'Title A');
      const checksum2 = embeddingService.generateContentChecksum('Chunk content payload 1', 'Title A');
      const checksum3 = embeddingService.generateContentChecksum('Chunk content payload 2', 'Title A');

      expect(checksum1).toBe(checksum2);
      expect(checksum1).not.toBe(checksum3);
    });

    it('Executes batch embeddings with exponential backoff retries', async () => {
      const vectors = await embeddingService.generateBatchEmbeddingsWithRetry(['Sample text chunk 1', 'Sample text chunk 2']);
      expect(vectors.length).toBe(2);
      expect(vectors[0].length).toBe(768);
    });

    it('Processes document embeddings end-to-end with progress tracking', async () => {
      const result = await embeddingService.processDocumentEmbeddings('doc-test-101');
      expect(result.processed).toBeGreaterThanOrEqual(0);
      expect(result.failed).toBe(0);

      const progress = embeddingService.getJobProgress('doc-test-101');
      expect(progress.documentId).toBe('doc-test-101');
      expect(progress.status).toBe('Completed');
    });
  });

  describe('2. Enterprise Embedding REST API Endpoints (/admin/embeddings/*)', () => {
    it('POST /admin/embeddings/start/:documentId starts async embedding job', async () => {
      const res = await request(app).post('/admin/embeddings/start/doc-api-test');
      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
      expect(res.body.job.documentId).toBe('doc-api-test');
    });

    it('GET /admin/embeddings/progress/:documentId returns real-time progress', async () => {
      const res = await request(app).get('/admin/embeddings/progress/doc-api-test');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.job.documentId).toBe('doc-api-test');
    });

    it('POST /admin/embeddings/pause/:documentId pauses job execution', async () => {
      const res = await request(app).post('/admin/embeddings/pause/doc-api-test');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('POST /admin/embeddings/resume/:documentId resumes paused job execution', async () => {
      const res = await request(app).post('/admin/embeddings/resume/doc-api-test');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /admin/embeddings/stats returns overall pipeline statistics', async () => {
      const res = await request(app).get('/admin/embeddings/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.dimension).toBe(768);
    });
  });
});
