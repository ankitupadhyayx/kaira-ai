import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { uploadMiddleware } from '../middleware/upload.middleware';

export const adminRouter = Router();

// ============================================================================
// PHASE 2 PROCESS PIPELINE APIS (/admin/process/*)
// ============================================================================

// 1. Trigger Processing Job (POST /admin/process/:documentId)
adminRouter.post('/process/:documentId', (req, res, next) => {
  adminController.createProcessingJob(req, res, next);
});

// 2. List Processing Jobs (GET /admin/process/jobs)
adminRouter.get('/process/jobs', (req, res, next) => {
  adminController.listProcessingJobs(req, res, next);
});

// 3. Get Processing Job Details (GET /admin/process/:jobId)
adminRouter.get('/process/:jobId', (req, res, next) => {
  adminController.getProcessingJobById(req, res, next);
});

// 4. Retry Processing Job (POST /admin/process/:jobId/retry)
adminRouter.post('/process/:jobId/retry', (req, res, next) => {
  adminController.retryProcessingJob(req, res, next);
});

// ============================================================================
// PHASE 1 REST API ENDPOINTS (/admin/documents/*)
// ============================================================================

// Upload Document API (POST /admin/documents/upload)
adminRouter.post('/documents/upload', uploadMiddleware.any(), (req, res, next) => {
  adminController.uploadDocuments(req, res, next);
});

// Query Logs API (GET /admin/documents/logs)
adminRouter.get('/documents/logs', (req, res, next) => {
  adminController.getLogs(req, res, next);
});

// Query Knowledge Library API (GET /admin/documents)
adminRouter.get('/documents', (req, res, next) => {
  adminController.getDocuments(req, res, next);
});

// Get Single Document Metadata (GET /admin/documents/:id)
adminRouter.get('/documents/:id', (req, res, next) => {
  adminController.getDocumentById(req, res, next);
});

// Get Document Chunks API (GET /admin/documents/:id/chunks)
adminRouter.get('/documents/:id/chunks', (req, res, next) => {
  adminController.getDocumentChunks(req, res, next);
});

// Document Preview (GET /admin/documents/:id/preview)
adminRouter.get('/documents/:id/preview', (req, res, next) => {
  adminController.previewDocument(req, res, next);
});

// Update Metadata (PATCH /admin/documents/:id)
adminRouter.patch('/documents/:id', (req, res, next) => {
  adminController.updateDocument(req, res, next);
});

// Soft Delete (DELETE /admin/documents/:id)
adminRouter.delete('/documents/:id', (req, res, next) => {
  adminController.softDeleteDocument(req, res, next);
});

// Restore Soft-Deleted Document (POST /admin/documents/:id/restore)
adminRouter.post('/documents/:id/restore', (req, res, next) => {
  adminController.restoreDocument(req, res, next);
});

// Upload New Version (POST /admin/documents/:id/versions)
adminRouter.post('/documents/:id/versions', uploadMiddleware.any(), (req, res, next) => {
  adminController.uploadNewVersion(req, res, next);
});

// ============================================================================
// BACKWARD COMPATIBILITY ALIASES (/admin/upload, /admin/files, etc.)
// ============================================================================

adminRouter.post('/upload', uploadMiddleware.any(), (req, res, next) => {
  adminController.uploadDocuments(req, res, next);
});

adminRouter.get('/files', (req, res, next) => {
  adminController.getDocuments(req, res, next);
});

adminRouter.get('/files/:id', (req, res, next) => {
  adminController.getDocumentById(req, res, next);
});

adminRouter.delete('/files/:id', (req, res, next) => {
  adminController.softDeleteDocument(req, res, next);
});

adminRouter.patch('/files/:id', (req, res, next) => {
  adminController.updateDocument(req, res, next);
});

adminRouter.post('/files/:id/replace', uploadMiddleware.any(), (req, res, next) => {
  adminController.uploadNewVersion(req, res, next);
});

adminRouter.get('/files/:id/preview', (req, res, next) => {
  adminController.previewDocument(req, res, next);
});

adminRouter.get('/logs', (req, res, next) => {
  adminController.getLogs(req, res, next);
});

adminRouter.get('/status', (req, res, next) => {
  adminController.getStatus(req, res, next);
});

adminRouter.get('/settings', (req, res, next) => {
  adminController.getSettings(req, res, next);
});

adminRouter.put('/settings', (req, res, next) => {
  adminController.updateSettings(req, res, next);
});

adminRouter.get('/stats', (req, res, next) => {
  adminController.getStats(req, res, next);
});

// ============================================================================
// ENTERPRISE EMBEDDING PIPELINE APIS (/admin/embeddings/*)
// ============================================================================

adminRouter.post('/embeddings/start/:documentId', (req, res, next) => {
  adminController.startEmbeddingJob(req, res, next);
});

adminRouter.post('/embeddings/pause/:documentId', (req, res, next) => {
  adminController.pauseEmbeddingJob(req, res, next);
});

adminRouter.post('/embeddings/resume/:documentId', (req, res, next) => {
  adminController.resumeEmbeddingJob(req, res, next);
});

adminRouter.post('/embeddings/retry-failed/:documentId', (req, res, next) => {
  adminController.retryFailedEmbeddingJob(req, res, next);
});

adminRouter.post('/embeddings/cancel/:documentId', (req, res, next) => {
  adminController.cancelEmbeddingJob(req, res, next);
});

adminRouter.get('/embeddings/progress/:documentId', (req, res, next) => {
  adminController.getEmbeddingJobProgress(req, res, next);
});

adminRouter.get('/embeddings/stats', (req, res, next) => {
  adminController.getEmbeddingStats(req, res, next);
});
