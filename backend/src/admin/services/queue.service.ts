import { ProcessingJobRecord } from '../types/admin.types';
import { pipelineService } from './pipeline.service';

export class QueueService {
  /**
   * Enqueues a document for processing pipeline execution.
   */
  public async enqueue(documentId: string): Promise<ProcessingJobRecord> {
    return pipelineService.createJob(documentId);
  }

  /**
   * Retries or resumes a failed/interrupted processing job.
   */
  public async retry(jobId: string): Promise<ProcessingJobRecord> {
    return pipelineService.retryJob(jobId);
  }

  /**
   * Gets job status details by ID.
   */
  public getJobStatus(jobId: string): ProcessingJobRecord | undefined {
    return pipelineService.getJob(jobId);
  }

  /**
   * Lists processing jobs with filters.
   */
  public listJobs(options?: { documentId?: string; status?: string; limit?: number }) {
    return pipelineService.listJobs(options);
  }
}

export const queueService = new QueueService();
