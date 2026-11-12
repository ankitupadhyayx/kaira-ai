import { AdminLogEntry, AdminLogAction } from '../types/admin.types';
import { query } from '../../shared/utils/db';

export class LogService {
  private logs: AdminLogEntry[] = [];

  constructor() {
    this.loadLogsFromDb();
  }

  private async loadLogsFromDb(): Promise<void> {
    try {
      const res = await query(`SELECT * FROM admin_logs ORDER BY timestamp DESC LIMIT 200`);
      if (res && res.rows && res.rows.length > 0) {
        this.logs = res.rows.map((row: any) => ({
          id: row.id,
          timestamp: new Date(row.timestamp).toISOString(),
          user: (row.metadata && row.metadata.user) || 'System Admin',
          action: row.action as any,
          document_id: row.metadata && row.metadata.document_id,
          status: (row.metadata && row.metadata.status) || 'INFO',
          message: row.details || '',
          details: row.details,
        }));
      }
    } catch (err) {
      console.warn('⚠️ Could not load audit logs from Neon PostgreSQL:', err);
    }
  }

  public recordLog(
    action: AdminLogAction,
    message: string,
    options?: {
      user?: string;
      document_id?: string;
      status?: 'SUCCESS' | 'INFO' | 'WARN' | 'ERROR';
      details?: string;
    }
  ): AdminLogEntry {
    const entry: AdminLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: options?.user || 'System Admin',
      action,
      document_id: options?.document_id,
      status: options?.status || 'INFO',
      message,
      details: options?.details,
    };

    this.logs.unshift(entry);

    query(
      `INSERT INTO admin_logs (id, timestamp, action, details, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        entry.id,
        new Date(),
        action,
        message,
        JSON.stringify({
          user: entry.user,
          document_id: entry.document_id,
          status: entry.status,
        }),
      ]
    ).catch((err) => console.error('❌ Failed to sync audit log to PostgreSQL:', err));

    return entry;
  }

  public getLogs(
    optionsOrLimit?: { limit?: number; action?: string; search?: string } | number,
    actionFilter?: string
  ): AdminLogEntry[] {
    let limit: number | undefined;
    let action: string | undefined;

    if (typeof optionsOrLimit === 'object' && optionsOrLimit !== null) {
      limit = optionsOrLimit.limit;
      action = optionsOrLimit.action;
    } else {
      limit = optionsOrLimit;
      action = actionFilter;
    }

    let result = [...this.logs];
    if (action && action !== 'ALL') {
      result = result.filter((l) => l.action === action);
    }
    if (limit) {
      result = result.slice(0, limit);
    }
    return result;
  }

  public clearLogs(): void {
    this.logs = [];
    query(`TRUNCATE TABLE admin_logs`).catch((err) => console.error('❌ Failed to clear admin_logs in PostgreSQL:', err));
  }
}

export const logService = new LogService();
