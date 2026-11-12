import path from 'path';
import fs from 'fs';
import {
  EnterpriseDocumentMetadata,
  SupportedFileType,
} from '../types/admin.types';
import { validationService } from './validation.service';
import { cloudinaryService } from './cloudinary.service';
import { metadataService } from './metadata.service';
import { logService } from './log.service';
import { versionService } from './version.service';
import { queueService } from './queue.service';

export class UploadService {
  public async uploadNewVersion(
    documentId: string,
    file: Express.Multer.File,
    uploaderUser: string = 'System Admin',
    changelog?: string
  ): Promise<EnterpriseDocumentMetadata> {
    return versionService.uploadNewVersion(documentId, file, uploaderUser, changelog);
  }
  public async processUpload(
    files: Express.Multer.File[],
    uploaderUser: string = 'System Admin',
    departmentInput?: string,
    visibilityInput?: string
  ): Promise<{
    uploaded: EnterpriseDocumentMetadata[];
    warnings: string[];
  }> {
    const uploaded: EnterpriseDocumentMetadata[] = [];
    const warnings: string[] = [];

    for (const file of files) {
      const filename = file.originalname;

      logService.recordLog(
        'Upload Started',
        `Started file upload for '${filename}' (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        { user: uploaderUser }
      );

      try {
        // 1. Validate file format and size
        validationService.validateFile(file);

        // 2. Compute SHA-256 hash
        const hash = validationService.calculateHash(file.buffer || file.path);

        // 3. Check duplicate uploads
        const duplicateHashDoc = metadataService.findByHash(hash);
        if (duplicateHashDoc) {
          warnings.push(`File '${filename}' is a duplicate upload of document '${duplicateHashDoc.title}' (SHA-256 match).`);
        }

        // 4. Generate unique document_id
        const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const ext = validationService.getExtension(filename) as SupportedFileType;

        // 5. Upload file directly to Cloudinary
        const cldResult = await cloudinaryService.uploadDocument(file, docId);

        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

        // 6. Assemble Metadata with Cloudinary secure_url ONLY
        const metadataRecord: EnterpriseDocumentMetadata = {
          document_id: docId,
          title: filename,
          original_filename: filename,
          display_name: filename,
          mime_type: file.mimetype,
          extension: ext,
          size: cldResult.bytes || file.size,
          hash: `sha256:${hash}`,
          cloudinary_url: cldResult.secure_url,
          cloudinary_public_id: cldResult.public_id,
          version: 'Version 1',
          version_number: 1,
          status: 'Uploaded',
          department: departmentInput || 'General Operations',
          visibility: (visibilityInput as any) || 'Internal',
          language: 'English (en-US)',
          author: uploaderUser,
          description: `Uploaded enterprise knowledge document ${filename}`,
          tags: ['Uploaded', ext],
          uploaded_by: uploaderUser,
          created_at: now,
          updated_at: now,
          last_accessed: now,
          deleted_at: null,
          is_active: true,
          version_history: [],
        };

        // Save metadata to PostgreSQL & memory
        const created = metadataService.create(metadataRecord);
        uploaded.push(created);

        // Clean up temporary Multer upload file on disk
        if (file.path && fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {
            // ignore cleanup warning
          }
        }

        // Auto-enqueue processing job
        queueService.enqueue(docId).catch((err: any) => {
          console.error(`[UploadService] Auto-processing enqueue failed for document ${docId}:`, err);
        });

        logService.recordLog(
          'Upload Completed',
          `Successfully stored document '${filename}' (ID: ${docId}) on Cloudinary (${cldResult.secure_url}). Status: Uploaded.`,
          { user: uploaderUser, document_id: docId, status: 'SUCCESS' }
        );
      } catch (err: any) {
        // Clean up temporary Multer upload file on disk on error
        if (file.path && fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {}
        }

        logService.recordLog(
          'Upload Failed',
          `Upload failed for file '${filename}': ${err.message}`,
          { user: uploaderUser, status: 'ERROR', details: err.stack }
        );
        throw err;
      }
    }

    return { uploaded, warnings };
  }
}

export const uploadService = new UploadService();
