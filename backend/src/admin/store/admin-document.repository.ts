import {
  DocumentRecord,
  LibraryQueryParams,
  EnterpriseDocumentMetadata,
} from '../types/admin.types';
import { metadataService } from '../services/metadata.service';

export class AdminDocumentRepository {
  public getAll(): DocumentRecord[] {
    const items = metadataService.query({ include_deleted: false }).items;
    return items.map((i) => metadataService.toDocumentRecord(i));
  }

  public getById(id: string): DocumentRecord | undefined {
    const doc = metadataService.getById(id);
    if (!doc || !doc.is_active) return undefined;
    return metadataService.toDocumentRecord(doc);
  }

  public query(params: LibraryQueryParams) {
    const res = metadataService.query(params);
    return {
      items: res.items.map((i) => metadataService.toDocumentRecord(i)),
      total: res.total,
      page: res.page,
      limit: res.limit,
      totalPages: res.totalPages,
    };
  }

  public create(doc: DocumentRecord): DocumentRecord {
    const metaDoc = metadataService.create({
      document_id: doc.id || doc.document_id || `doc-${Date.now()}`,
      title: doc.metadata?.title || doc.title || doc.filename || 'Untitled',
      original_filename: doc.originalName || doc.filename || 'file.txt',
      display_name: doc.originalName || doc.filename || 'file.txt',
      mime_type: doc.mimeType || 'text/plain',
      extension: doc.metadata?.documentType || (doc.filename || '').split('.').pop()?.toUpperCase() || 'TXT',
      size: doc.size || 0,
      hash: doc.metadata?.checksum || 'sha256:hash',
      cloudinary_url: doc.storagePath || '',
      cloudinary_public_id: `cld_${doc.id}`,
      version: doc.metadata?.version || 'Version 1',
      version_number: 1,
      status: doc.status as any,
      department: doc.metadata?.department || 'General Operations',
      visibility: doc.metadata?.visibility || 'Internal',
      language: doc.metadata?.language || 'English (en-US)',
      author: doc.metadata?.author || 'System Admin',
      description: doc.metadata?.description || '',
      tags: doc.metadata?.tags || [],
      uploaded_by: 'System Admin',
      created_at: doc.uploadDate || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_accessed: new Date().toISOString(),
      deleted_at: null,
      is_active: true,
    });
    return metadataService.toDocumentRecord(metaDoc);
  }

  public update(id: string, updates: Partial<DocumentRecord>): DocumentRecord | undefined {
    const updated = metadataService.update(id, {
      title: updates.metadata?.title || updates.title,
      description: updates.metadata?.description || updates.description,
      tags: updates.metadata?.tags || updates.tags,
      department: updates.metadata?.department || updates.department,
      visibility: updates.metadata?.visibility || updates.visibility,
    });
    return updated ? metadataService.toDocumentRecord(updated) : undefined;
  }

  public delete(id: string): DocumentRecord | undefined {
    const doc = metadataService.getById(id);
    if (!doc) return undefined;
    metadataService.softDelete(id);
    return metadataService.toDocumentRecord(doc);
  }
}

export const adminDocumentRepository = new AdminDocumentRepository();
