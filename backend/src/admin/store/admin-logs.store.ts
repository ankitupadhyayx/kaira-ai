import fs from 'fs';
import path from 'path';
import { AdminLogEntry, LogLevel, AdminActionType } from '../types/admin.types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const LOGS_FILE = path.join(DATA_DIR, 'admin-logs.json');

const INITIAL_LOGS: AdminLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2026-08-04 09:16:02',
    user: 'System Admin',
    action: 'Upload',
    documentName: 'Mobiloitte_Company_Profile_2026.pdf',
    level: 'SUCCESS',
    source: 'VectorIndexer',
    message: 'Indexed 142 vector chunks into Qdrant collection [vec_mob_01] for Mobiloitte_Company_Profile_2026.pdf. Status: Ready.',
  },
  {
    id: 'log-2',
    timestamp: '2026-08-04 09:15:45',
    user: 'System Admin',
    action: 'Upload',
    documentName: 'Mobiloitte_Company_Profile_2026.pdf',
    level: 'INFO',
    source: 'EmbeddingService',
    message: 'Generated dense vector embeddings (dim: 1536) for 142 chunks using text-embedding-3-small',
  },
  {
    id: 'log-3',
    timestamp: '2026-08-04 09:15:30',
    user: 'System Admin',
    action: 'Upload',
    documentName: 'Mobiloitte_Company_Profile_2026.pdf',
    level: 'INFO',
    source: 'ChunkerEngine',
    message: 'Recursive token splitter chunked Mobiloitte_Company_Profile_2026.pdf into 142 chunks (chunkSize: 1024, overlap: 128)',
  },
  {
    id: 'log-4',
    timestamp: '2026-08-04 09:15:23',
    user: 'System Admin',
    action: 'Upload',
    documentName: 'Mobiloitte_Company_Profile_2026.pdf',
    level: 'INFO',
    source: 'ExtractionService',
    message: 'Extracted raw text (48,200 tokens) from Mobiloitte_Company_Profile_2026.pdf',
  },
];

export class AdminLogsStore {
  private logs: AdminLogEntry[] = [];

  constructor() {
    this.ensureDirectory();
    this.loadLogs();
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadLogs(): void {
    try {
      if (fs.existsSync(LOGS_FILE)) {
        const raw = fs.readFileSync(LOGS_FILE, 'utf-8');
        this.logs = JSON.parse(raw);
      } else {
        this.logs = INITIAL_LOGS;
        this.saveLogs();
      }
    } catch (err) {
      this.logs = INITIAL_LOGS;
    }
  }

  private saveLogs(): void {
    try {
      this.ensureDirectory();
      fs.writeFileSync(LOGS_FILE, JSON.stringify(this.logs, null, 2), 'utf-8');
    } catch (err) {
      console.error('[AdminLogsStore] Failed to save logs:', err);
    }
  }

  public addLog(
    level: LogLevel,
    source: string,
    message: string,
    options?: { user?: string; action?: AdminActionType; documentName?: string; details?: string }
  ): AdminLogEntry {
    const entry: AdminLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: options?.user || 'System Admin',
      action: options?.action || 'Upload',
      documentName: options?.documentName,
      level,
      source,
      message,
      details: options?.details,
    };

    this.logs.unshift(entry);
    if (this.logs.length > 500) {
      this.logs = this.logs.slice(0, 500);
    }

    this.saveLogs();
    return entry;
  }

  public getLogs(options?: { level?: string; source?: string; search?: string; limit?: number }): AdminLogEntry[] {
    let result = [...this.logs];

    if (options?.level && options.level !== 'ALL') {
      result = result.filter((l) => l.level === options.level);
    }

    if (options?.source && options.source !== 'ALL') {
      result = result.filter((l) => l.source.toLowerCase().includes(options.source!.toLowerCase()));
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      result = result.filter(
        (l) =>
          l.message.toLowerCase().includes(q) ||
          l.source.toLowerCase().includes(q) ||
          (l.user && l.user.toLowerCase().includes(q)) ||
          (l.documentName && l.documentName.toLowerCase().includes(q)) ||
          l.timestamp.includes(q)
      );
    }

    const limit = options?.limit || 100;
    return result.slice(0, limit);
  }

  public clear(): void {
    this.logs = [];
    this.saveLogs();
  }
}

export const adminLogsStore = new AdminLogsStore();
