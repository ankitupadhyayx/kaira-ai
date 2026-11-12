import {
  EnterpriseDocumentMetadata,
  LibraryQueryParams,
  PreviewDataResult,
  AdminLogEntry,
} from '../types/admin.types';
import { metadataService } from './metadata.service';
import { previewService } from './preview.service';
import { logService } from './log.service';
import { versionService } from './version.service';
import { cloudinaryService } from './cloudinary.service';
import { chunkStorageService } from '../store/chunk.repository';
import { NotFoundError } from '../../shared/errors/app-error';

export class KnowledgeService {
  public getDocuments(params: LibraryQueryParams) {
    return metadataService.query(params);
  }

  public getDocumentById(id: string): EnterpriseDocumentMetadata {
    const doc = metadataService.getById(id);
    if (!doc) {
      throw new NotFoundError(`Document with ID '${id}' not found in Knowledge Repository.`);
    }
    return doc;
  }

  public previewDocument(id: string): PreviewDataResult {
    const doc = this.getDocumentById(id);
    logService.recordLog(
      'Viewed',
      `Previewed document content for '${doc.title}' (${doc.document_id})`,
      { document_id: doc.document_id, status: 'INFO' }
    );
    return previewService.generatePreview(doc);
  }

  public updateMetadata(
    id: string,
    updates: Partial<EnterpriseDocumentMetadata>,
    updatedBy: string = 'System Admin'
  ): EnterpriseDocumentMetadata {
    const doc = this.getDocumentById(id);
    const updated = metadataService.update(id, updates);

    logService.recordLog(
      'Metadata Update',
      `Updated metadata attributes for document '${doc.title}'.`,
      { user: updatedBy, document_id: id, status: 'INFO' }
    );

    return updated!;
  }

  public async deleteDocument(id: string, deletedBy: string = 'System Admin'): Promise<EnterpriseDocumentMetadata> {
    const doc = this.getDocumentById(id);

    // 1. Delete Cloudinary asset using public_id
    if (doc.cloudinary_public_id) {
      const isImage = (doc.mime_type || '').startsWith('image/');
      await cloudinaryService.deleteDocument(doc.cloudinary_public_id, isImage ? 'image' : 'raw');
    }

    // 2. Delete chunks from PostgreSQL
    await chunkStorageService.deleteChunksByDocumentId(id);

    // 3. Delete document row from PostgreSQL & memory
    metadataService.deleteDocument(id);

    // 4. Log deletion
    logService.recordLog(
      'Deleted',
      `Permanently deleted document '${doc.title}' (ID: ${id}), Cloudinary asset, and PostgreSQL chunks.`,
      { user: deletedBy, document_id: id, status: 'WARN' }
    );

    return doc;
  }

  public softDeleteDocument(id: string, deletedBy: string = 'System Admin'): EnterpriseDocumentMetadata {
    const doc = this.getDocumentById(id);
    metadataService.softDelete(id);

    logService.recordLog(
      'Deleted',
      `Soft deleted document '${doc.title}' (ID: ${id}). Marked is_active = false.`,
      { user: deletedBy, document_id: id, status: 'WARN' }
    );

    return doc;
  }

  public restoreDocument(id: string, restoredBy: string = 'System Admin'): EnterpriseDocumentMetadata {
    const doc = metadataService.getById(id);
    if (!doc) {
      throw new NotFoundError(`Document with ID '${id}' not found to restore.`);
    }

    metadataService.restore(id);

    logService.recordLog(
      'Restored',
      `Restored soft-deleted document '${doc.title}' (ID: ${id}). Marked is_active = true.`,
      { user: restoredBy, document_id: id, status: 'SUCCESS' }
    );

    return doc;
  }

  public getLogs(options?: { action?: string; status?: string; search?: string; limit?: number }): AdminLogEntry[] {
    return logService.getLogs(options);
  }

  public restoreVersion(documentId: string, versionId: string, user: string = 'System Admin') {
    const restored = versionService.restoreVersion(documentId, versionId);
    if (!restored) {
      throw new NotFoundError(`Version '${versionId}' not found for document '${documentId}'.`);
    }
    logService.recordLog(
      'Restored',
      `Restored historical version '${versionId}' for document '${restored.title}'.`,
      { user, document_id: documentId, status: 'SUCCESS' }
    );
    return restored;
  }
}

export const knowledgeService = new KnowledgeService();
