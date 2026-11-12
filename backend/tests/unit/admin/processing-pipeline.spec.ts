import request from 'supertest';
import { ExpressGateway } from '../../../src/ingestion/gateway/express.gateway';
import { extractionService } from '../../../src/admin/services/extraction.service';
import { ocrService } from '../../../src/admin/services/ocr.service';
import { cleaningService } from '../../../src/admin/services/cleaning.service';
import { normalizationService } from '../../../src/admin/services/normalization.service';
import { chunkService } from '../../../src/admin/services/chunk.service';
import { pipelineService } from '../../../src/admin/services/pipeline.service';
import { metadataService } from '../../../src/admin/services/metadata.service';

describe('Phase 2 Foundation — Processing Pipeline & Isolated Services', () => {
  let app: any;

  beforeAll(() => {
    const gateway = new ExpressGateway();
    app = gateway.app;

    // Seed initial document for testing
    metadataService.create({
      document_id: 'doc-phase2-test',
      title: 'Phase 2 Test Ingestion Document',
      original_filename: 'Phase2_Test.txt',
      display_name: 'Phase2_Test.txt',
      mime_type: 'text/plain',
      extension: 'TXT',
      size: 1520,
      hash: 'sha256:testphase2hash',
      cloudinary_url: '/data/uploads/Phase2_Test.txt',
      cloudinary_public_id: 'cld_phase2_test',
      version: 'Version 1',
      version_number: 1,
      status: 'Uploaded',
      department: 'Artificial Intelligence Practice',
      visibility: 'Internal',
      language: 'English (en-US)',
      author: 'AI Architect',
      description: 'Test document for Phase 2 processing pipeline verification.',
      tags: ['Test', 'Phase2'],
      uploaded_by: 'System Admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_accessed: new Date().toISOString(),
      deleted_at: null,
      is_active: true,
    });
  });

  describe('1. Isolated Unit Tests for Single-Responsibility Services', () => {
    it('ExtractionService extracts raw text payload from document file', () => {
      const result = extractionService.extractText('/non/existent/path.txt', 'Phase2_Test.txt');
      expect(result.rawText).toBeDefined();
      expect(result.charCount).toBeGreaterThan(0);
      expect(result.wordCount).toBeGreaterThan(0);
    });

    it('OCRService performs OCR processing for image and scan documents', () => {
      const ocrImage = ocrService.processOCR('/path/scan.png', 'scan.png');
      expect(ocrImage.isScanned).toBe(true);
      expect(ocrImage.ocrEngine).toContain('Tesseract');
      expect(ocrImage.confidence).toBeGreaterThan(0.9);

      const ocrText = ocrService.processOCR('/path/doc.txt', 'doc.txt', 'Direct raw text content');
      expect(ocrText.isScanned).toBe(false);
      expect(ocrText.ocrText).toBe('Direct raw text content');
    });

    it('CleaningService sanitizes control characters, extra spaces, and line breaks', () => {
      const dirty = '  Header\r\n\r\nLine 1   \x00 with   spaces.\n\n\n\nLine 2.  ';
      const clean = cleaningService.cleanText(dirty);
      expect(clean).toBe('Header\n\nLine 1 with spaces.\n\nLine 2.');
    });

    it('NormalizationService standardizes smart quotes and Unicode NFKC', () => {
      const nonNormalized = '“Smart Quotes” and — Em Dash —';
      const normalized = normalizationService.normalizeText(nonNormalized);
      expect(normalized).toBe('"Smart Quotes" and - Em Dash -');
    });

    it('ChunkService recursively splits normalized text into token chunks', () => {
      const sampleText = 'Paragraph 1: Mobiloitte enterprise AI platform.\n\nParagraph 2: FastPath deterministic responses.';
      const chunks = chunkService.generateChunks('doc-101', sampleText, 50, 10, { title: 'Doc' });

      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].id).toContain('chunk_doc-101_0');
      expect(chunks[0].tokenCount).toBeGreaterThan(0);
    });
  });

  describe('2. Pipeline Orchestrator & End-to-End Processing Jobs', () => {
    it('PipelineService executes end-to-end processing job step-by-step', async () => {
      const job = await pipelineService.createJob('doc-phase2-test');
      expect(job.job_id).toBeDefined();
      expect(job.document_id).toBe('doc-phase2-test');
      expect(job.stage).toBe('Queued');

      // Wait for asynchronous pipeline execution to complete
      await new Promise((resolve) => setTimeout(resolve, 800));

      const completedJob = pipelineService.getJob(job.job_id);
      expect(completedJob!.status).toBe('Completed');
      expect(completedJob!.stage).toBe('Completed');
      expect(completedJob!.progress).toBe(100);
      expect(completedJob!.results.rawText).toBeDefined();
      expect(completedJob!.results.cleanedText).toBeDefined();
      expect(completedJob!.results.normalizedText).toBeDefined();
      expect(completedJob!.results.extractedMetadata).toBeDefined();
      expect(completedJob!.results.chunks).toBeDefined();
    });

    it('PipelineService supports retry and resume on processing jobs', async () => {
      const job = await pipelineService.createJob('doc-phase2-test');
      await new Promise((resolve) => setTimeout(resolve, 800));

      const retriedJob = await pipelineService.retryJob(job.job_id);
      expect(retriedJob.retry_count).toBeGreaterThan(0);

      await new Promise((resolve) => setTimeout(resolve, 800));
      const finalJob = pipelineService.getJob(job.job_id);
      expect(finalJob!.status).toBe('Completed');
    });
  });

  describe('3. Phase 2 REST API Endpoints (/admin/process/*)', () => {
    let createdJobId: string;

    beforeEach(() => {
      metadataService.create({
        document_id: 'doc-phase2-test',
        title: 'Phase 2 Test Ingestion Document',
        original_filename: 'Phase2_Test.txt',
        display_name: 'Phase2_Test.txt',
        mime_type: 'text/plain',
        extension: 'TXT',
        size: 1520,
        hash: 'sha256:testphase2hash',
        cloudinary_url: '/data/uploads/Phase2_Test.txt',
        cloudinary_public_id: 'cld_phase2_test',
        version: 'Version 1',
        version_number: 1,
        status: 'Uploaded',
        department: 'Artificial Intelligence Practice',
        visibility: 'Internal',
        language: 'English (en-US)',
        author: 'AI Architect',
        description: 'Test document for Phase 2 processing pipeline verification.',
        tags: ['Test', 'Phase2'],
        uploaded_by: 'System Admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_accessed: new Date().toISOString(),
        deleted_at: null,
        is_active: true,
      });
    });

    it('POST /admin/process/:documentId enqueues processing job', async () => {
      const res = await request(app).post('/admin/process/doc-phase2-test');

      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
      expect(res.body.job).toBeDefined();
      expect(res.body.job.document_id).toBe('doc-phase2-test');
      createdJobId = res.body.job.job_id;
    });

    it('GET /admin/process/jobs returns list of all processing jobs', async () => {
      const res = await request(app).get('/admin/process/jobs');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.jobs)).toBe(true);
      expect(res.body.jobs.length).toBeGreaterThan(0);
    });

    it('GET /admin/process/:jobId returns processing job status and logs', async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const res = await request(app).get(`/admin/process/${createdJobId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.job.job_id).toBe(createdJobId);
      expect(Array.isArray(res.body.job.logs)).toBe(true);
    });

    it('POST /admin/process/:jobId/retry retries specified processing job', async () => {
      const res = await request(app).post(`/admin/process/${createdJobId}/retry`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.job.job_id).toBe(createdJobId);
      expect(res.body.job.retry_count).toBeGreaterThan(0);
    });
  });
});
