export type ContentLifecycleStatus =
  | 'DRAFT'
  | 'REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'DEPRECATED'
  | 'ARCHIVED';

export type VersionType = 'MAJOR' | 'MINOR' | 'PATCH' | 'HOTFIX';

export interface VersionMetadata {
  domain: string;
  version: string;
  schema_version: string;
  created_at: string;
  updated_at: string;
  author: string;
  reviewed_by?: string;
  approved_by?: string;
  status: ContentLifecycleStatus;
  change_log: string[];
  release_notes?: string;
}

export interface AuditLogRecord {
  auditId: string;
  domain: string;
  recordId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ROLLBACK' | 'STATUS_CHANGE';
  changedBy: string;
  timestamp: string;
  reason: string;
  previousValue?: any;
  currentValue?: any;
}

export interface VersionSnapshot {
  snapshotId: string;
  domain: string;
  version: string;
  timestamp: string;
  recordsCount: number;
  data: any[];
}
