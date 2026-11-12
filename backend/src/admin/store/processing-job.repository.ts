import { ProcessingJobRecord } from '../types/admin.types';
import { query } from '../../shared/utils/db';

export class ProcessingJobRepository {
  private jobs: ProcessingJobRecord[] = [];

  constructor() {
    this.loadJobsFromDb();
  }

  private async loadJobsFromDb(): Promise<void> {
    try {
      const res = await query(`SELECT * FROM processing_jobs ORDER BY started_at DESC`);
      if (res && res.rows && res.rows.length > 0) {
        this.jobs = res.rows.map((row: any) => ({
          job_id: row.job_id,
          document_id: row.document_id,
          stage: row.stage as any,
          status: row.status as any,
          progress: row.progress || 0,
          started_at: new Date(row.started_at).toISOString(),
          finished_at: row.finished_at ? new Date(row.finished_at).toISOString() : null,
          duration: row.duration || 0,
          retry_count: row.retry_count || 0,
          error_message: row.error_message || null,
          logs: typeof row.logs === 'string' ? JSON.parse(row.logs) : row.logs || [],
          results: typeof row.results === 'string' ? JSON.parse(row.results) : row.results || {},
        }));
      }
    } catch (err) {
      console.warn('⚠️ Could not load processing jobs from Neon PostgreSQL:', err);
    }
  }

  public create(job: ProcessingJobRecord): ProcessingJobRecord {
    this.jobs.unshift(job);

    query(
      `INSERT INTO processing_jobs (job_id, document_id, stage, status, progress, started_at, finished_at, duration, retry_count, error_message, logs, results)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (job_id) DO UPDATE SET
       stage = EXCLUDED.stage, status = EXCLUDED.status, progress = EXCLUDED.progress, finished_at = EXCLUDED.finished_at, error_message = EXCLUDED.error_message, logs = EXCLUDED.logs, results = EXCLUDED.results`,
      [
        job.job_id,
        job.document_id,
        job.stage,
        job.status,
        job.progress,
        new Date(job.started_at),
        job.finished_at ? new Date(job.finished_at) : null,
        job.duration,
        job.retry_count,
        job.error_message,
        JSON.stringify(job.logs || []),
        JSON.stringify(job.results || {}),
      ]
    ).catch((err) => console.error('❌ Failed to sync processing job creation to PostgreSQL:', err));

    return job;
  }

  public getById(jobId: string): ProcessingJobRecord | undefined {
    return this.jobs.find((j) => j.job_id === jobId);
  }

  public getByDocumentId(documentId: string): ProcessingJobRecord[] {
    return this.jobs.filter((j) => j.document_id === documentId);
  }

  public list(options?: { documentId?: string; status?: string; limit?: number }): ProcessingJobRecord[] {
    let result = [...this.jobs];

    if (options?.documentId) {
      result = result.filter((j) => j.document_id === options.documentId);
    }

    if (options?.status && options.status !== 'ALL') {
      result = result.filter((j) => j.status === options.status);
    }

    const limit = options?.limit || 100;
    return result.slice(0, limit);
  }

  public update(jobId: string, updates: Partial<ProcessingJobRecord>): ProcessingJobRecord | undefined {
    const index = this.jobs.findIndex((j) => j.job_id === jobId);
    if (index === -1) return undefined;

    this.jobs[index] = {
      ...this.jobs[index],
      ...updates,
    };

    const updatedJob = this.jobs[index];

    query(
      `UPDATE processing_jobs SET stage = $1, status = $2, progress = $3, finished_at = $4, duration = $5, retry_count = $6, error_message = $7, logs = $8, results = $9 WHERE job_id = $10`,
      [
        updatedJob.stage,
        updatedJob.status,
        updatedJob.progress,
        updatedJob.finished_at ? new Date(updatedJob.finished_at) : null,
        updatedJob.duration,
        updatedJob.retry_count,
        updatedJob.error_message,
        JSON.stringify(updatedJob.logs || []),
        JSON.stringify(updatedJob.results || {}),
        jobId,
      ]
    ).catch((err) => console.error('❌ Failed to update processing job in PostgreSQL:', err));

    return updatedJob;
  }

  public delete(jobId: string): boolean {
    const initialLen = this.jobs.length;
    this.jobs = this.jobs.filter((j) => j.job_id !== jobId);
    query(`DELETE FROM processing_jobs WHERE job_id = $1`, [jobId]).catch((err) =>
      console.error(`❌ Failed to delete job ${jobId} from PostgreSQL:`, err)
    );
    return this.jobs.length !== initialLen;
  }
}

export const processingJobRepository = new ProcessingJobRepository();
