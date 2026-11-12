import { Request, Response, NextFunction } from 'express';
import { uploadService } from '../services/upload.service';
import { knowledgeService } from '../services/knowledge.service';
import { metadataService } from '../services/metadata.service';
import { queueService } from '../services/queue.service';
import { adminSettingsStore } from '../store/admin-settings.store';
import { chunkStorageService } from '../services/chunk-storage.service';
import { embeddingService } from '../services/embedding.service';
import { ValidationError, NotFoundError } from '../../shared/errors/app-error';

export class AdminController {
  // 1. Upload API (POST /admin/documents/upload & POST /admin/upload)
  public async uploadDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let files: Express.Multer.File[] = [];
      if (req.files && Array.isArray(req.files)) {
        files = req.files as Express.Multer.File[];
      } else if (req.file) {
        files = [req.file];
      }

      if (!files || files.length === 0) {
        throw new ValidationError('No document file provided in upload request payload.');
      }

      const uploaderUser = (req.body.uploaded_by as string) || (req.body.author as string) || 'System Admin';
      const department = (req.body.department as string) || 'General Operations';
      const visibility = (req.body.visibility as string) || 'Internal';

      const { uploaded, warnings } = await uploadService.processUpload(
        files,
        uploaderUser,
        department,
        visibility
      );

      const docs = uploaded.map((d) => metadataService.toDocumentRecord(d));

      res.status(201).json({
        success: true,
        message: `Successfully uploaded ${uploaded.length} document(s) to Cloudinary knowledge storage.`,
        warnings,
        total: uploaded.length,
        uploaded: uploaded,
        documents: uploaded,
        data: docs,
      });
    } catch (error) {
      next(error);
    }
  }

  // 2. Library Query (GET /admin/documents & GET /admin/files)
  public async getDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string;
      const type = (req.query.type || req.query.extension) as string;
      const status = req.query.status as string;
      const department = req.query.department as string;
      const visibility = req.query.visibility as string;
      const language = req.query.language as string;
      const include_deleted = req.query.include_deleted === 'true';
      const sortBy = (req.query.sortBy || 'created_at') as any;
      const order = (req.query.order || 'desc') as any;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = knowledgeService.getDocuments({
        search,
        type,
        status,
        department,
        visibility,
        language,
        include_deleted,
        sortBy,
        order,
        page,
        limit,
      });

      const legacyItems = result.items.map((d) => metadataService.toDocumentRecord(d));

      res.status(200).json({
        success: true,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        documents: result.items,
        data: legacyItems,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/documents/:id & GET /admin/files/:id
  public async getDocumentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const doc = knowledgeService.getDocumentById(id);

      if (!doc.is_active && req.query.include_deleted !== 'true') {
        throw new NotFoundError(`Document with ID '${id}' has been soft deleted or does not exist.`);
      }

      const legacyDoc = metadataService.toDocumentRecord(doc);

      res.status(200).json({
        success: true,
        document: doc,
        data: legacyDoc,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/documents/:id/preview & GET /admin/files/:id/preview
  public async previewDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const previewData = knowledgeService.previewDocument(id);

      res.status(200).json({
        success: true,
        data: previewData,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /admin/documents/:id & PATCH /admin/files/:id
  public async updateDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const body = req.body || {};

      const updates: any = {
        title: body.title || body.metadata?.title,
        description: body.description || body.metadata?.description,
        tags: body.tags || body.metadata?.tags,
        department: body.department || body.metadata?.department,
        visibility: body.visibility || body.metadata?.visibility,
        language: body.language || body.metadata?.language,
        author: body.author || body.metadata?.author,
      };

      Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

      const updated = knowledgeService.updateMetadata(id, updates);
      const legacyDoc = metadataService.toDocumentRecord(updated);

      res.status(200).json({
        success: true,
        message: `Updated metadata for document '${updated.title}'.`,
        document: updated,
        data: legacyDoc,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /admin/documents/:id & DELETE /admin/files/:id (Permanent Delete)
  public async softDeleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await knowledgeService.deleteDocument(id);
      const legacyDoc = metadataService.toDocumentRecord(deleted);

      res.status(200).json({
        success: true,
        message: `Successfully deleted document '${deleted.title}', Cloudinary asset, and PostgreSQL chunks.`,
        document: deleted,
        data: legacyDoc,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /admin/documents/:id/restore
  public async restoreDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const restored = knowledgeService.restoreDocument(id);
      const legacyDoc = metadataService.toDocumentRecord(restored);

      res.status(200).json({
        success: true,
        message: `Restored document '${restored.title}'. Status is marked is_active = true.`,
        document: restored,
        data: legacyDoc,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /admin/documents/:id/versions
  public async uploadNewVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const file = req.file || (req.files && Array.isArray(req.files) ? req.files[0] : undefined);
      if (!file) {
        throw new ValidationError('No file provided for new document version.');
      }

      const changelog = req.body.changelog as string;
      const uploaderUser = (req.body.uploaded_by as string) || 'System Admin';

      const updated = await uploadService.uploadNewVersion(id, file, uploaderUser, changelog);
      const legacyDoc = metadataService.toDocumentRecord(updated);

      res.status(200).json({
        success: true,
        message: `Successfully uploaded ${updated.version} for document '${updated.title}'.`,
        document: updated,
        data: legacyDoc,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/documents/logs & GET /admin/logs
  public async getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const action = req.query.action as string;
      const status = req.query.status as string;
      const search = req.query.search as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 200;

      const logs = knowledgeService.getLogs({ action, status, search, limit });

      res.status(200).json({
        success: true,
        total: logs.length,
        logs,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // PHASE 2 PROCESS PIPELINE APIS
  // ============================================================================

  // POST /admin/process/:documentId
  public async createProcessingJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const job = await queueService.enqueue(documentId);

      res.status(202).json({
        success: true,
        message: `Phase 2 processing job '${job.job_id}' enqueued for document '${documentId}'.`,
        job,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/process/jobs
  public async listProcessingJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.query.documentId as string;
      const status = req.query.status as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

      const jobs = queueService.listJobs({ documentId, status, limit });

      res.status(200).json({
        success: true,
        total: jobs.length,
        jobs,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/process/:jobId
  public async getProcessingJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      const job = queueService.getJobStatus(jobId);

      res.status(200).json({
        success: true,
        job,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/documents/:id/chunks
  public async getDocumentChunks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const chunks = chunkStorageService.getDocumentChunks(id);

      res.status(200).json({
        success: true,
        total: chunks.length,
        chunks,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /admin/process/:jobId/retry
  public async retryProcessingJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      const job = await queueService.retry(jobId);

      res.status(200).json({
        success: true,
        message: `Retrying processing job '${jobId}'. Current stage: '${job.stage}'.`,
        job,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/status
  public async getStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const allDocs = metadataService.query({ include_deleted: false }).items;
      const jobs = queueService.listJobs();

      res.status(200).json({
        success: true,
        pipeline: {
          activeWorkerNodes: 4,
          processingQueueSize: jobs.filter((j: any) => j.status === 'Queued' || j.status === 'Processing').length,
          status: 'IDLE',
          currentStage: 'Phase 2 - Document Processing Pipeline',
          stageCounts: {
            Uploaded: allDocs.filter((d) => d.status === 'Uploaded').length,
            Uploading: allDocs.filter((d) => d.status === 'Uploading').length,
            Failed: allDocs.filter((d) => d.status === 'Failed').length,
            CompletedJobs: jobs.filter((j: any) => j.status === 'Completed').length,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/settings
  public async getSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = adminSettingsStore.getSettings();
      res.status(200).json({
        success: true,
        settings,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /admin/settings
  public async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = adminSettingsStore.updateSettings(req.body || {});
      res.status(200).json({
        success: true,
        message: 'Admin configuration settings updated.',
        settings: updated,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/stats
  public async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeDocs = metadataService.query({ include_deleted: false }).items;
      const jobs = queueService.listJobs();
      const totalSizeBytes = activeDocs.reduce((acc, d) => acc + d.size, 0);

      const totalChunks = jobs.reduce((acc: number, j: any) => acc + (j.results.chunks?.length || 0), 0);

      res.status(200).json({
        success: true,
        data: {
          totalFiles: activeDocs.length,
          totalChunks,
          readyFiles: activeDocs.filter((d) => d.status === 'Uploaded').length,
          pendingFiles: activeDocs.filter((d) => d.status === 'Uploading').length,
          failedFiles: activeDocs.filter((d) => d.status === 'Failed').length,
          storageUsedBytes: totalSizeBytes,
          storageUsedFormatted: `${(totalSizeBytes / 1024 / 1024).toFixed(2)} MB`,
          processingStatusBreakdown: {
            Uploaded: activeDocs.filter((d) => d.status === 'Uploaded').length,
            Uploading: activeDocs.filter((d) => d.status === 'Uploading').length,
            Failed: activeDocs.filter((d) => d.status === 'Failed').length,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // ENTERPRISE EMBEDDING CONTROL APIS (/admin/embeddings/*)
  // ============================================================================

  // POST /admin/embeddings/start/:documentId
  public async startEmbeddingJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const { model, version } = req.body || {};
      const jobProgress = await embeddingService.startJob(documentId, model, version);
      res.status(202).json({
        success: true,
        message: `Asynchronous embedding job started for document '${documentId}'.`,
        job: jobProgress,
        data: jobProgress,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /admin/embeddings/pause/:documentId
  public async pauseEmbeddingJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      embeddingService.pauseJob(documentId);
      res.status(200).json({
        success: true,
        message: `Embedding job paused for document '${documentId}'.`,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /admin/embeddings/resume/:documentId
  public async resumeEmbeddingJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const result = await embeddingService.resumeJob(documentId);
      res.status(200).json({
        success: true,
        message: `Embedding job resumed for document '${documentId}'.`,
        result,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /admin/embeddings/retry-failed/:documentId
  public async retryFailedEmbeddingJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const result = await embeddingService.retryFailed(documentId);
      res.status(200).json({
        success: true,
        message: `Retrying failed embedding batches for document '${documentId}'.`,
        result,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /admin/embeddings/cancel/:documentId
  public async cancelEmbeddingJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      embeddingService.cancelJob(documentId);
      res.status(200).json({
        success: true,
        message: `Embedding job cancelled for document '${documentId}'.`,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/embeddings/progress/:documentId
  public async getEmbeddingJobProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const progress = embeddingService.getJobProgress(documentId);
      res.status(200).json({
        success: true,
        job: progress,
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/embeddings/stats
  public async getEmbeddingStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await embeddingService.getOverallStats();
      res.status(200).json({
        success: true,
        stats,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
