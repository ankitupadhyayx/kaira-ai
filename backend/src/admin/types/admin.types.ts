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

export type DocumentStorageStatus = 'Uploading' | 'Uploaded' | 'Failed';
export type DocumentProcessingStatus = DocumentStorageStatus | 'Ready' | 'Extracted' | 'Cleaned' | 'Chunked' | 'Embedded' | 'Indexed' | 'Processing';

export type ProcessingJobStage =
  | 'Uploaded'
  | 'Queued'
  | 'Downloading'
  | 'Extracting'
  | 'OCR'
  | 'Cleaning'
  | 'Normalizing'
  | 'Metadata'
  | 'Chunking'
  | 'Completed'
  | 'Failed';

export type ProcessingJobStatus = 'Queued' | 'Processing' | 'Completed' | 'Failed' | 'Paused';

export interface AdminSettings {
  defaultLanguage: string;
  allowedFileTypes: SupportedFileType[];
  maxUploadSizeBytes: number;
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
  llmModel: string;
  vectorDb: string;
  fastPathEnabled: boolean;
  ragEnabled: boolean;
  strictConfidenceGuard: boolean;
  topKResults: number;
}

export interface CloudinaryUploadResult {
  public_id: string;
  url: string;
  secure_url: string;
  resource_type: string;
  format: string;
  bytes: number;
}

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
  status: DocumentStorageStatus | DocumentProcessingStatus;
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
  versionHistory?: any[];
  local_storage_path?: string;
}

export interface DocumentRecord {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: DocumentStorageStatus | DocumentProcessingStatus;
  uploadDate: string;
  processedDate?: string;
  chunkCount: number;
  embeddingStatus: string;
  vectorStatus: string;
  storagePath: string;
  document_id?: string;
  title?: string;
  original_filename?: string;
  display_name?: string;
  extension?: string;
  hash?: string;
  cloudinary_url?: string;
  cloudinary_public_id?: string;
  version?: string;
  version_number?: number;
  department?: string;
  visibility?: 'Internal' | 'Public' | 'Confidential' | 'Restricted';
  language?: string;
  author?: string;
  description?: string;
  tags?: string[];
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
  last_accessed?: string;
  deleted_at?: string | null;
  is_active?: boolean;
  version_history?: DocumentVersionRecord[];
  versionHistory?: any[];
  local_storage_path?: string;
  metadata: {
    title: string;
    description?: string;
    tags: string[];
    department: string;
    visibility: 'Internal' | 'Public' | 'Confidential' | 'Restricted';
    version: string;
    language: string;
    author: string;
    createdDate: string;
    modifiedDate: string;
    source: string;
    documentType: string;
    checksum?: string;
    indexId?: string;
    tokenCount?: number;
  };
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  cleanText: string;
  tokenCount: number;
  startOffset: number;
  endOffset: number;
  metadata?: {
    title?: string;
    department?: string;
    section?: string;
    [key: string]: any;
  };
}

export interface ProcessingJobLogEntry {
  timestamp: string;
  stage: ProcessingJobStage;
  message: string;
  status: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
}

export interface ProcessingJobResult {
  rawText?: string;
  ocrText?: string;
  cleanedText?: string;
  normalizedText?: string;
  extractedMetadata?: {
    charCount?: number;
    wordCount?: number;
    lineCount?: number;
    language?: string;
    extractedAt?: string;
    [key: string]: any;
  };
  chunks?: DocumentChunk[];
  embeddings?: { processed: number; failed: number };
}

export interface ProcessingJobRecord {
  job_id: string;
  document_id: string;
  stage: ProcessingJobStage;
  status: ProcessingJobStatus;
  progress: number; // 0 - 100%
  started_at: string;
  finished_at: string | null;
  duration: number; // ms
  retry_count: number;
  error_message: string | null;
  logs: ProcessingJobLogEntry[];
  results: ProcessingJobResult;
}

export type AdminLogAction =
  | 'Upload Started'
  | 'Upload Completed'
  | 'Upload Failed'
  | 'Deleted'
  | 'Restored'
  | 'Viewed'
  | 'Metadata Update'
  | 'Version Uploaded'
  | 'Processing Queued'
  | 'Processing Completed'
  | 'Processing Failed';

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

export interface LibraryQueryParams {
  search?: string;
  type?: string;
  status?: string;
  department?: string;
  visibility?: string;
  language?: string;
  author?: string;
  include_deleted?: boolean;
  sortBy?: 'created_at' | 'size' | 'title' | 'original_filename' | 'filename' | 'uploadDate' | 'chunkCount';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PreviewDataResult {
  document_id: string;
  title: string;
  original_filename: string;
  extension: string;
  mime_type: string;
  cloudinary_url: string;
  preview_type: 'pdf' | 'markdown' | 'text' | 'json' | 'csv' | 'binary_fallback';
  raw_content?: string;
  json_data?: any;
  csv_rows?: string[][];
  message?: string;
}
