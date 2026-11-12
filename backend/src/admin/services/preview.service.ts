import fs from 'fs';
import { EnterpriseDocumentMetadata, PreviewDataResult } from '../types/admin.types';

export class PreviewService {
  public generatePreview(doc: EnterpriseDocumentMetadata): PreviewDataResult {
    const ext = doc.extension.toUpperCase();
    const result: PreviewDataResult = {
      document_id: doc.document_id,
      title: doc.title,
      original_filename: doc.original_filename,
      extension: doc.extension,
      mime_type: doc.mime_type,
      cloudinary_url: doc.cloudinary_url,
      preview_type: 'binary_fallback',
    };

    let rawBuffer: Buffer | null = null;
    if (doc.local_storage_path && fs.existsSync(doc.local_storage_path)) {
      try {
        rawBuffer = fs.readFileSync(doc.local_storage_path);
      } catch (err) {
        rawBuffer = null;
      }
    }

    if (ext === 'PDF') {
      result.preview_type = 'pdf';
      result.message = 'PDF built-in viewer available via Cloudinary URL.';
      return result;
    }

    if (ext === 'MD' || ext === 'MARKDOWN') {
      result.preview_type = 'markdown';
      result.raw_content = rawBuffer
        ? rawBuffer.toString('utf-8')
        : `# ${doc.title}\n\n*${doc.description || 'Markdown enterprise document.'}*\n\nIngested on ${doc.created_at}. Author: ${doc.author}.`;
      return result;
    }

    if (ext === 'TXT') {
      result.preview_type = 'text';
      result.raw_content = rawBuffer
        ? rawBuffer.toString('utf-8')
        : `DOCUMENT CONTENT PREVIEW: ${doc.title}\n\n${doc.description || 'Plain text content.'}`;
      return result;
    }

    if (ext === 'JSON') {
      result.preview_type = 'json';
      if (rawBuffer) {
        try {
          result.json_data = JSON.parse(rawBuffer.toString('utf-8'));
        } catch (err) {
          result.json_data = { title: doc.title, description: doc.description };
        }
      } else {
        result.json_data = {
          document_id: doc.document_id,
          title: doc.title,
          department: doc.department,
          tags: doc.tags,
        };
      }
      return result;
    }

    if (ext === 'CSV') {
      result.preview_type = 'csv';
      if (rawBuffer) {
        const text = rawBuffer.toString('utf-8');
        result.csv_rows = text
          .split('\n')
          .filter((line) => line.trim().length > 0)
          .slice(0, 50)
          .map((line) => line.split(','));
      } else {
        result.csv_rows = [
          ['Header 1', 'Header 2', 'Header 3'],
          ['Value 1', 'Value 2', 'Value 3'],
        ];
      }
      return result;
    }

    // DOCX / PPTX / Binary fallback
    result.preview_type = 'binary_fallback';
    result.message = `Preview unavailable for .${ext.toLowerCase()} format. Direct document download or Cloudinary viewer link provided.`;
    return result;
  }
}

export const previewService = new PreviewService();
