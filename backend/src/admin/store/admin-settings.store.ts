import fs from 'fs';
import path from 'path';
import { AdminSettings } from '../types/admin.types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'admin-settings.json');

const DEFAULT_SETTINGS: AdminSettings = {
  defaultLanguage: 'English (en-US)',
  allowedFileTypes: ['PDF', 'DOCX', 'DOC', 'TXT', 'MD', 'CSV', 'XLSX', 'PPTX', 'JSON'],
  maxUploadSizeBytes: 52428800, // 50 MB
  chunkSize: 1024,
  chunkOverlap: 128,
  embeddingModel: 'text-embedding-3-small',
  llmModel: 'Gemini 1.5 Flash',
  vectorDb: 'PostgreSQL + pgvector (Local)',
  fastPathEnabled: true,
  ragEnabled: true,
  strictConfidenceGuard: true,
  topKResults: 5,
};

export class AdminSettingsStore {
  private settings: AdminSettings;

  constructor() {
    this.ensureDirectory();
    this.settings = this.loadSettings();
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadSettings(): AdminSettings {
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.error('[AdminSettingsStore] Failed to load settings:', err);
    }
    return { ...DEFAULT_SETTINGS };
  }

  private saveSettings(): void {
    try {
      this.ensureDirectory();
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(this.settings, null, 2), 'utf-8');
    } catch (err) {
      console.error('[AdminSettingsStore] Failed to save settings:', err);
    }
  }

  public getSettings(): AdminSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<AdminSettings>): AdminSettings {
    this.settings = {
      ...this.settings,
      ...newSettings,
    };
    this.saveSettings();
    return { ...this.settings };
  }
}

export const adminSettingsStore = new AdminSettingsStore();
