import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { ExpressGateway } from '../../../src/ingestion/gateway/express.gateway';
import { adminDocumentRepository } from '../../../src/admin/store/admin-document.repository';
import { adminSettingsStore } from '../../../src/admin/store/admin-settings.store';

describe('Admin Control Center APIs — Integration Suite', () => {
  let app: any;

  beforeAll(() => {
    const gateway = new ExpressGateway();
    app = gateway.app;
  });

  describe('1. Module 1: Upload API (POST /admin/upload)', () => {
    const sampleTxtPath = path.join(__dirname, 'test_sample.txt');

    beforeAll(() => {
      fs.writeFileSync(sampleTxtPath, 'Mobiloitte Enterprise RAG Knowledge Document Text Content');
    });

    afterAll(() => {
      if (fs.existsSync(sampleTxtPath)) {
        fs.unlinkSync(sampleTxtPath);
      }
    });

    it('successfully uploads a valid .txt file and stores metadata', async () => {
      const res = await request(app)
        .post('/admin/upload')
        .attach('file', sampleTxtPath);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].originalName).toBe('test_sample.txt');
      expect(res.body.data[0].status).toBe('Uploaded');
      expect(res.body.data[0].id).toBeDefined();
    });

    it('rejects unsupported file extension with BadRequestError', async () => {
      const invalidFilePath = path.join(__dirname, 'invalid_file.exe');
      fs.writeFileSync(invalidFilePath, 'binary content');

      const res = await request(app)
        .post('/admin/upload')
        .attach('file', invalidFilePath);

      fs.unlinkSync(invalidFilePath);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/Unsupported file type/i);
    });
  });

  describe('2. Module 2: Library API (GET, PATCH, DELETE /admin/files)', () => {
    it('GET /admin/files returns paginated documents list with filtering & sorting', async () => {
      const res = await request(app)
        .get('/admin/files?page=1&limit=5&sortBy=uploadDate&order=desc');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
    });

    it('GET /admin/files/:id returns single document by ID', async () => {
      const docs = adminDocumentRepository.getAll();
      const targetId = docs[0].id;

      const res = await request(app).get(`/admin/files/${targetId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(targetId);
    });

    it('GET /admin/files/:id returns 404 for non-existent document ID', async () => {
      const res = await request(app).get('/admin/files/non-existent-doc-id');

      expect(res.status).toBe(404);
      expect(res.body.error.message).toMatch(/not found/i);
    });

    it('PATCH /admin/files/:id updates tags and description', async () => {
      const docs = adminDocumentRepository.getAll();
      const targetId = docs[0].id;

      const res = await request(app)
        .patch(`/admin/files/${targetId}`)
        .send({
          tags: ['UpdatedTag', 'Test'],
          description: 'Updated test document description',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metadata.tags).toContain('UpdatedTag');
      expect(res.body.data.metadata.description).toBe('Updated test document description');
    });

    it('DELETE /admin/files/:id removes document from repository', async () => {
      const docs = adminDocumentRepository.getAll();
      const targetId = docs[docs.length - 1].id;

      const res = await request(app).delete(`/admin/files/${targetId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(targetId);

      const checkRes = await request(app).get(`/admin/files/${targetId}`);
      expect(checkRes.status).toBe(404);
    });
  });

  describe('3. Module 3: Processing API (GET /admin/status & GET /admin/logs)', () => {
    it('GET /admin/status returns pipeline worker status and stage counts', async () => {
      const res = await request(app).get('/admin/status');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.pipeline).toBeDefined();
      expect(res.body.pipeline.activeWorkerNodes).toBeGreaterThan(0);
      expect(res.body.pipeline.stageCounts).toBeDefined();
    });

    it('GET /admin/logs returns activity log stream', async () => {
      const res = await request(app).get('/admin/logs?limit=10');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('4. Module 4: Settings API (GET & PUT /admin/settings)', () => {
    it('GET /admin/settings returns current RAG settings', async () => {
      const res = await request(app).get('/admin/settings');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.chunkSize).toBeDefined();
      expect(res.body.data.embeddingModel).toBeDefined();
    });

    it('PUT /admin/settings updates settings values', async () => {
      const res = await request(app)
        .put('/admin/settings')
        .send({
          chunkSize: 2048,
          chunkOverlap: 256,
          embeddingModel: 'text-embedding-3-large',
          fastPathEnabled: true,
          ragEnabled: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.chunkSize).toBe(2048);
      expect(res.body.data.chunkOverlap).toBe(256);
      expect(res.body.data.embeddingModel).toBe('text-embedding-3-large');
    });
  });

  describe('5. Module 5: Statistics API (GET /admin/stats)', () => {
    it('GET /admin/stats returns aggregate metrics', async () => {
      const res = await request(app).get('/admin/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalFiles).toBeGreaterThanOrEqual(0);
      expect(res.body.data.totalChunks).toBeGreaterThanOrEqual(0);
      expect(res.body.data.storageUsedBytes).toBeGreaterThanOrEqual(0);
      expect(res.body.data.processingStatusBreakdown).toBeDefined();
    });
  });
});
