import {
  EnterpriseDocumentMetadata,
  DocumentVersionRecord,
  CloudinaryUploadResult,
} from '../types/admin.types';
import { metadataService } from './metadata.service';
import { validationService } from './validation.service';
import { cloudinaryService } from './cloudinary.service';

export class VersionService {
  public async uploadNewVersion(
    documentId: string,
    file: Express.Multer.File,
    uploaderUser: string = 'System Admin',
    changelog?: string
  ): Promise<EnterpriseDocumentMetadata> {
    const doc = metadataService.getById(documentId);
    if (!doc) {
      throw new Error(`Document '${documentId}' not found for version update.`);
    }

    const hash = validationService.calculateHash(file.buffer || file.path);
    const cldResult = await cloudinaryService.uploadDocument(file, doc.document_id);

    return this.createNextVersion(doc, file, cldResult, `sha256:${hash}`, uploaderUser, changelog);
  }
  public createNextVersion(
    doc: EnterpriseDocumentMetadata,
    file: Express.Multer.File,
    cldResult: CloudinaryUploadResult,
    hash: string,
    uploadedBy: string = 'System Admin',
    changelog?: string
  ): EnterpriseDocumentMetadata {
    const nextVerNumber = (doc.version_number || 1) + 1;
    const nextVerString = `Version ${nextVerNumber}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const snapshot: DocumentVersionRecord = {
      version_id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      document_id: doc.document_id,
      version_number: doc.version_number || 1,
      version_string: doc.version || 'Version 1',
      original_filename: doc.original_filename,
      size: doc.size,
      hash: doc.hash,
      cloudinary_url: doc.cloudinary_url,
      cloudinary_public_id: doc.cloudinary_public_id,
      changelog: changelog || `Archived prior to upgrading to ${nextVerString}`,
      uploaded_by: doc.uploaded_by || uploadedBy,
      created_at: doc.created_at,
    };

    const history = doc.version_history ? [...doc.version_history, snapshot] : [snapshot];

    const updated = metadataService.update(doc.document_id, {
      original_filename: file.originalname,
      display_name: file.originalname,
      size: file.size,
      hash,
      cloudinary_url: cldResult.secure_url,
      cloudinary_public_id: cldResult.public_id,
      version: nextVerString,
      version_number: nextVerNumber,
      version_history: history,
      status: 'Uploaded',
      updated_at: now,
      local_storage_path: file.path,
    });

    return updated!;
  }

  public getVersionHistory(documentId: string): DocumentVersionRecord[] {
    const doc = metadataService.getById(documentId);
    if (!doc) return [];
    return doc.version_history || [];
  }

  public restoreVersion(documentId: string, versionId: string): EnterpriseDocumentMetadata | undefined {
    const doc = metadataService.getById(documentId);
    if (!doc || !doc.version_history) return undefined;

    const targetIndex = doc.version_history.findIndex(
      (v) => v.version_id === versionId || v.version_string === versionId
    );
    if (targetIndex === -1) return undefined;

    const targetVer = doc.version_history[targetIndex];
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const activeSnapshot: DocumentVersionRecord = {
      version_id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      document_id: doc.document_id,
      version_number: doc.version_number,
      version_string: doc.version,
      original_filename: doc.original_filename,
      size: doc.size,
      hash: doc.hash,
      cloudinary_url: doc.cloudinary_url,
      cloudinary_public_id: doc.cloudinary_public_id,
      changelog: `Saved state before restoring ${targetVer.version_string}`,
      uploaded_by: doc.uploaded_by,
      created_at: doc.created_at,
    };

    const updatedHistory = [...doc.version_history];
    updatedHistory.splice(targetIndex, 1);
    updatedHistory.push(activeSnapshot);

    const restored = metadataService.update(documentId, {
      original_filename: targetVer.original_filename,
      display_name: targetVer.original_filename,
      size: targetVer.size,
      hash: targetVer.hash,
      cloudinary_url: targetVer.cloudinary_url,
      cloudinary_public_id: targetVer.cloudinary_public_id,
      version: targetVer.version_string,
      version_number: targetVer.version_number,
      version_history: updatedHistory,
      status: 'Uploaded',
      updated_at: now,
    });

    return restored;
  }
}

export const versionService = new VersionService();
