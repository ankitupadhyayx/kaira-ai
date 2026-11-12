export type SupportedFileType =
  | 'PDF'
  | 'DOCX'
  | 'DOC'
  | 'TXT'
  | 'MD'
  | 'CSV'
  | 'XLSX'
  | 'PPTX'
  | 'JSON'
  | 'IMAGE'
  | 'ZIP'
  | 'HTML';

export type DocumentStorageStatus = 'Uploading' | 'Uploaded' | 'Failed' | 'Ready' | 'Extracted' | 'Cleaned' | 'Chunked' | 'Embedded' | 'Indexed' | 'Processing';

export interface DocumentVersionRecord {
  version_id: string;
  document_id: string;
  version_number: number;
  version_string: string;
  original_filename: string;
  size: number;
  hash: string;
  cloudinary_url: string;
  cloudinary_public_id: string;
  changelog?: string;
  uploaded_by: string;
  created_at: string;
}

export interface EnterpriseDocumentMetadata {
  document_id: string;
  title: string;
  original_filename: string;
  display_name: string;
  mime_type: string;
  extension: string;
  size: number;
  hash: string;
  cloudinary_url: string;
  cloudinary_public_id: string;
  version: string;
  version_number: number;
  status: DocumentStorageStatus;
  department: string;
  visibility: 'Internal' | 'Public' | 'Confidential' | 'Restricted';
  language: string;
  author: string;
  description?: string;
  tags: string[];
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  last_accessed: string;
  deleted_at: string | null;
  is_active: boolean;
  version_history?: DocumentVersionRecord[];
}

export interface UploadQueueItem {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  type: SupportedFileType | 'UNSUPPORTED';
  progress: number;
  status: 'Ready' | 'Uploading' | 'Completed' | 'Failed';
  errorMessage?: string;
}

export interface AdminSettings {
  defaultLanguage: string;
  allowedFileTypes: SupportedFileType[];
  maxUploadSizeBytes: number;
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
  llmModel: string;
  vectorDb: string;
  topKResults: number;
  ragEnabled: boolean;
  fastPathEnabled: boolean;
  ocrEnabled?: boolean;
  ocrLanguage?: string;
  defaultDepartment?: string;
  defaultVisibility?: string;
}

export type AdminLogAction =
  | 'Upload Started'
  | 'Upload Completed'
  | 'Upload Failed'
  | 'Deleted'
  | 'Restored'
  | 'Viewed'
  | 'Metadata Update'
  | 'Version Uploaded';

export interface AdminLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: AdminLogAction;
  document_id?: string;
  status: 'SUCCESS' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  details?: string;
}

export interface AdminDashboardMetrics {
  totalUploadedFiles: number;
  readyFilesCount: number;
  pendingFilesCount: number;
  failedFilesCount: number;
  storageUsedBytes: number;
  averageFileSizeBytes: number;
  lastUploadTime: string;
  supportedFileTypesCount: number;
}
