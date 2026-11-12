'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  EnterpriseDocumentMetadata,
  UploadQueueItem,
  AdminSettings,
  AdminLogEntry,
  AdminDashboardMetrics,
  SupportedFileType,
  DocumentVersionRecord,
} from '../../../types/admin';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AdminContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  metrics: AdminDashboardMetrics;
  documents: EnterpriseDocumentMetadata[];
  uploadQueue: UploadQueueItem[];
  settings: AdminSettings;
  logs: AdminLogEntry[];
  toasts: ToastNotification[];

  // Active Modals State
  selectedDocForMetadata: EnterpriseDocumentMetadata | null;
  setSelectedDocForMetadata: (doc: EnterpriseDocumentMetadata | null) => void;
  selectedDocForEditMetadata: EnterpriseDocumentMetadata | null;
  setSelectedDocForEditMetadata: (doc: EnterpriseDocumentMetadata | null) => void;
  selectedDocForPreview: EnterpriseDocumentMetadata | null;
  setSelectedDocForPreview: (doc: EnterpriseDocumentMetadata | null) => void;
  selectedDocForChunks: EnterpriseDocumentMetadata | null;
  setSelectedDocForChunks: (doc: EnterpriseDocumentMetadata | null) => void;
  selectedDocForDelete: EnterpriseDocumentMetadata | null;
  setSelectedDocForDelete: (doc: EnterpriseDocumentMetadata | null) => void;
  selectedDocForReplace: EnterpriseDocumentMetadata | null;
  setSelectedDocForReplace: (doc: EnterpriseDocumentMetadata | null) => void;
  selectedDocForVersions: EnterpriseDocumentMetadata | null;
  setSelectedDocForVersions: (doc: EnterpriseDocumentMetadata | null) => void;

  // Actions
  refreshDocuments: () => Promise<void>;
  queueFiles: (files: File[]) => void;
  removeQueueItem: (id: string) => void;
  startUploadAll: () => Promise<void>;
  retryUploadItem: (id: string) => void;
  softDeleteDocument: (id: string) => Promise<void>;
  restoreDocument: (id: string) => Promise<void>;
  replaceDocument: (id: string, file: File, changelog?: string) => Promise<void>;
  updateDocumentMetadata: (id: string, updates: Partial<EnterpriseDocumentMetadata>) => Promise<void>;
  restoreDocumentVersion: (id: string, versionId: string) => Promise<void>;
  updateSettings: (newSettings: Partial<AdminSettings>) => void;
  clearLogs: () => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const API_BASE_URL = 'http://localhost:5000/admin';

const INITIAL_DOCUMENTS: EnterpriseDocumentMetadata[] = [];

const DEFAULT_SETTINGS: AdminSettings = {
  chunkSize: 600,
  chunkOverlap: 100,
  embeddingModel: 'text-embedding-004 (Gemini)',
  llmModel: 'Gemini 1.5 Pro',
  vectorDb: 'PostgreSQL + pgvector (Neon)',
  topKResults: 5,
  fastPathEnabled: true,
  ragEnabled: false,
  maxUploadSizeBytes: 52428800, // 50 MB
  allowedFileTypes: ['PDF', 'DOCX', 'DOC', 'TXT', 'MD', 'CSV', 'XLSX', 'PPTX', 'JSON'],
  ocrEnabled: true,
  ocrLanguage: 'en',
  defaultDepartment: 'General Operations',
  defaultVisibility: 'Internal',
  defaultLanguage: 'English (en-US)',
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [documents, setDocuments] = useState<EnterpriseDocumentMetadata[]>(INITIAL_DOCUMENTS);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Modals
  const [selectedDocForMetadata, setSelectedDocForMetadata] = useState<EnterpriseDocumentMetadata | null>(null);
  const [selectedDocForEditMetadata, setSelectedDocForEditMetadata] = useState<EnterpriseDocumentMetadata | null>(null);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<EnterpriseDocumentMetadata | null>(null);
  const [selectedDocForChunks, setSelectedDocForChunks] = useState<EnterpriseDocumentMetadata | null>(null);
  const [selectedDocForDelete, setSelectedDocForDelete] = useState<EnterpriseDocumentMetadata | null>(null);
  const [selectedDocForReplace, setSelectedDocForReplace] = useState<EnterpriseDocumentMetadata | null>(null);
  const [selectedDocForVersions, setSelectedDocForVersions] = useState<EnterpriseDocumentMetadata | null>(null);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = 'toast-' + Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const refreshDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/documents?include_deleted=true`);
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          setDocuments(data.items);
        }
      }
    } catch (err) {
      console.warn('[AdminContext] Backend offline, using cached store.');
    }
  };

  const refreshLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/logs?limit=50`);
      if (res.ok) {
        const data = await res.json();
        if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    refreshDocuments();
    refreshLogs();
  }, []);

  const getSupportedType = (fileName: string): SupportedFileType | 'UNSUPPORTED' => {
    const ext = fileName.split('.').pop()?.toUpperCase() as SupportedFileType;
    if (ext && settings.allowedFileTypes.includes(ext)) {
      return ext;
    }
    return 'UNSUPPORTED';
  };

  const queueFiles = (files: File[]) => {
    const newItems: UploadQueueItem[] = files.map((file) => {
      const type = getSupportedType(file.name);
      const isOverSize = file.size > settings.maxUploadSizeBytes;
      const isUnsupported = type === 'UNSUPPORTED';
      const isEmpty = file.size === 0;

      let errorMessage: string | undefined;
      if (isEmpty) errorMessage = `File is empty (0 bytes).`;
      if (isUnsupported) errorMessage = `File extension not allowed by policy.`;
      if (isOverSize) errorMessage = `File size exceeds limit (${(settings.maxUploadSizeBytes / 1024 / 1024).toFixed(0)} MB).`;

      return {
        id: 'queue-' + Math.random().toString(36).substring(2, 9),
        file,
        name: file.name,
        sizeBytes: file.size,
        type,
        progress: 0,
        status: isUnsupported || isOverSize || isEmpty ? 'Failed' : 'Ready',
        errorMessage,
      };
    });

    setUploadQueue((prev) => [...prev, ...newItems]);
    const validCount = newItems.filter((i) => i.status === 'Ready').length;
    if (validCount > 0) addToast('info', `Added ${validCount} file(s) to upload queue.`);
  };

  const removeQueueItem = (id: string) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const startUploadAll = async () => {
    const readyItems = uploadQueue.filter((item) => item.status === 'Ready' || item.status === 'Failed');
    if (readyItems.length === 0) return;

    addToast('info', `Uploading ${readyItems.length} document(s) to Cloudinary...`);

    for (const item of readyItems) {
      setUploadQueue((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'Uploading', progress: 10 } : i))
      );

      // Simulate smooth initial upload progress
      setTimeout(() => {
        setUploadQueue((prev) =>
          prev.map((i) => (i.id === item.id && i.status === 'Uploading' ? { ...i, progress: 45 } : i))
        );
      }, 300);

      try {
        const formData = new FormData();
        formData.append('files', item.file);
        formData.append('department', settings.defaultDepartment || 'General Operations');
        formData.append('visibility', settings.defaultVisibility || 'Internal');

        const res = await fetch(`${API_BASE_URL}/documents/upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        const isSuccess = res.ok && (data.success || (data.uploaded && data.uploaded.length > 0) || (data.documents && data.documents.length > 0));

        if (isSuccess) {
          setUploadQueue((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: 'Completed', progress: 100 } : i))
          );
          addToast('success', `Uploaded ${item.name} to Cloudinary knowledge storage.`);
          await refreshDocuments();
          await refreshLogs();
        } else {
          throw new Error(data.message || 'Cloudinary upload failed.');
        }
      } catch (err: any) {
        setUploadQueue((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'Failed', progress: 0, errorMessage: err.message } : i))
        );
        addToast('error', `Failed to upload ${item.name}: ${err.message}`);
      }
    }
  };

  const retryUploadItem = (id: string) => {
    setUploadQueue((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'Ready', progress: 0, errorMessage: undefined } : i))
    );
    startUploadAll();
  };

  const softDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        addToast('info', `Soft deleted document.`);
        await refreshDocuments();
        await refreshLogs();
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      setDocuments((prev) => prev.map((d) => (d.document_id === id ? { ...d, is_active: false, deleted_at: now } : d)));
    }
  };

  const restoreDocument = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/documents/${id}/restore`, {
        method: 'POST',
      });
      if (res.ok) {
        addToast('success', `Restored document.`);
        await refreshDocuments();
        await refreshLogs();
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      setDocuments((prev) => prev.map((d) => (d.document_id === id ? { ...d, is_active: true, deleted_at: null } : d)));
    }
  };

  const replaceDocument = async (id: string, file: File, changelog?: string) => {
    try {
      const formData = new FormData();
      formData.append('files', file);
      if (changelog) formData.append('changelog', changelog);

      const res = await fetch(`${API_BASE_URL}/documents/${id}/versions`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        addToast('success', `Uploaded new version for document.`);
        await refreshDocuments();
        await refreshLogs();
      } else {
        throw new Error('Failed to upload new version');
      }
    } catch (err: any) {
      addToast('error', `Failed to replace document: ${err.message}`);
    }
  };

  const updateDocumentMetadata = async (id: string, updates: Partial<EnterpriseDocumentMetadata>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        addToast('success', `Metadata updated for document.`);
        await refreshDocuments();
        await refreshLogs();
      } else {
        throw new Error('Metadata update failed');
      }
    } catch (err) {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      setDocuments((prev) => prev.map((d) => (d.document_id === id ? { ...d, ...updates, updated_at: now } : d)));
    }
  };

  const restoreDocumentVersion = async (id: string, versionId: string) => {
    addToast('success', `Restored document to version ${versionId}.`);
    await refreshDocuments();
  };

  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('success', 'Configuration settings updated.');
  };

  const clearLogs = () => {
    setLogs([]);
    addToast('info', 'Activity logs cleared.');
  };

  const activeDocs = documents.filter((d) => d.is_active && !d.deleted_at);
  const totalSizeBytes = activeDocs.reduce((acc, d) => acc + d.size, 0);
  const readyFilesCount = activeDocs.filter((d) => d.status === 'Ready' || d.status === 'Uploaded').length;
  const pendingFilesCount = activeDocs.filter((d) => d.status === 'Processing' || d.status === 'Uploading' || d.status === 'Chunked').length;
  const failedFilesCount = activeDocs.filter((d) => d.status === 'Failed').length;
  const avgFileSizeBytes = activeDocs.length > 0 ? totalSizeBytes / activeDocs.length : 0;
  const lastUpload = activeDocs.length > 0 ? activeDocs[0].created_at : 'No uploads yet';

  const metrics: AdminDashboardMetrics = {
    totalUploadedFiles: activeDocs.length,
    readyFilesCount,
    pendingFilesCount,
    failedFilesCount,
    storageUsedBytes: totalSizeBytes,
    averageFileSizeBytes: avgFileSizeBytes,
    lastUploadTime: lastUpload,
    supportedFileTypesCount: settings.allowedFileTypes.length,
  };

  return (
    <AdminContext.Provider
      value={{
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        metrics,
        documents,
        uploadQueue,
        settings,
        logs,
        toasts,

        selectedDocForMetadata,
        setSelectedDocForMetadata,
        selectedDocForEditMetadata,
        setSelectedDocForEditMetadata,
        selectedDocForPreview,
        setSelectedDocForPreview,
        selectedDocForChunks,
        setSelectedDocForChunks,
        selectedDocForDelete,
        setSelectedDocForDelete,
        selectedDocForReplace,
        setSelectedDocForReplace,
        selectedDocForVersions,
        setSelectedDocForVersions,

        refreshDocuments,
        queueFiles,
        removeQueueItem,
        startUploadAll,
        retryUploadItem,
        softDeleteDocument,
        restoreDocument,
        replaceDocument,
        updateDocumentMetadata,
        restoreDocumentVersion,
        updateSettings,
        clearLogs,
        addToast,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return ctx;
}
