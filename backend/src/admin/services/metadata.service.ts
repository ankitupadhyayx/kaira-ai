import {
  EnterpriseDocumentMetadata,
  LibraryQueryParams,
  DocumentRecord,
} from '../types/admin.types';
import { query } from '../../shared/utils/db';

export interface NLPMetadataPayload {
  language: string;
  page_count: number;
  word_count: number;
  character_count: number;
  reading_time: string;
  title: string | null;
  headings: string[];
  sections: string[];
  paragraph_count: number;
  file_statistics: {
    line_count: number;
    avg_word_length: number;
    avg_sentence_length: number;
  };
}

export class MetadataService {
  private documents: EnterpriseDocumentMetadata[] = [];

  constructor() {
    this.loadDocumentsFromDb();
  }

  private async loadDocumentsFromDb(): Promise<void> {
    try {
      const res = await query(`SELECT * FROM documents ORDER BY created_at DESC`);
      if (res && res.rows && res.rows.length > 0) {
        this.documents = res.rows.map((row: any) => ({
          document_id: row.id,
          title: row.original_filename,
          original_filename: row.original_filename,
          display_name: row.stored_filename || row.original_filename,
          mime_type: row.mime_type,
          extension: (row.original_filename.split('.').pop() || 'TXT').toUpperCase() as any,
          size: parseInt(row.file_size || '0', 10),
          hash: row.file_hash,
          cloudinary_url: row.cloudinary_url,
          cloudinary_public_id: row.cloudinary_public_id || '',
          version: row.version || 'Version 1',
          version_number: 1,
          status: row.status as any,
          department: row.department,
          visibility: row.visibility as any,
          language: row.language,
          author: row.uploaded_by,
          description: `Uploaded enterprise knowledge document ${row.original_filename}`,
          tags: ['Uploaded'],
          uploaded_by: row.uploaded_by,
          created_at: new Date(row.created_at).toISOString(),
          updated_at: new Date(row.updated_at).toISOString(),
          last_accessed: new Date(row.created_at).toISOString(),
          deleted_at: null,
          is_active: row.status !== 'Deleted',
        }));
      }
    } catch (err) {
      console.warn('⚠️ Could not load initial documents from Neon PostgreSQL:', err);
    }
  }

  public create(metadata: EnterpriseDocumentMetadata): EnterpriseDocumentMetadata {
    const existingIdx = this.documents.findIndex((d) => d.document_id === metadata.document_id);
    if (existingIdx >= 0) {
      this.documents[existingIdx] = metadata;
    } else {
      this.documents.unshift(metadata);
    }

    // Direct sync to Neon PostgreSQL documents table
    query(
      `INSERT INTO documents (id, original_filename, stored_filename, mime_type, cloudinary_url, cloudinary_public_id, file_size, file_hash, status, version, language, department, visibility, uploaded_by, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (id) DO UPDATE SET
       status = EXCLUDED.status, version = EXCLUDED.version, updated_at = EXCLUDED.updated_at`,
      [
        metadata.document_id,
        metadata.original_filename,
        metadata.display_name || metadata.original_filename,
        metadata.mime_type,
        metadata.cloudinary_url,
        metadata.cloudinary_public_id || null,
        metadata.size,
        metadata.hash,
        metadata.status,
        metadata.version,
        metadata.language,
        metadata.department,
        metadata.visibility,
        metadata.uploaded_by,
        new Date(metadata.created_at || new Date()),
        new Date(metadata.updated_at || new Date()),
      ]
    ).catch((err) => console.error('❌ Failed to sync document creation to PostgreSQL:', err));

    return metadata;
  }

  public getById(id: string): EnterpriseDocumentMetadata | undefined {
    return this.documents.find((d) => d.document_id === id || (d as any).id === id);
  }

  public getByHash(hash: string): EnterpriseDocumentMetadata | undefined {
    return this.documents.find((d) => d.hash === hash && d.is_active);
  }

  public findByHash(hash: string): EnterpriseDocumentMetadata | undefined {
    return this.getByHash(hash);
  }

  public query(params: LibraryQueryParams): {
    items: EnterpriseDocumentMetadata[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } {
    let result = [...this.documents];

    if (!params.include_deleted) {
      result = result.filter((d) => d.is_active);
    }

    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.original_filename.toLowerCase().includes(q) ||
          (d.description && d.description.toLowerCase().includes(q)) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params.type && params.type !== 'ALL') {
      result = result.filter((d) => d.extension.toUpperCase() === params.type!.toUpperCase());
    }

    if (params.department && params.department !== 'ALL') {
      result = result.filter((d) => d.department === params.department);
    }

    if (params.status && params.status !== 'ALL') {
      result = result.filter((d) => d.status === params.status);
    }

    const total = result.length;
    const page = params.page || 1;
    const limit = params.limit || 10;
    const totalPages = Math.ceil(total / limit) || 1;

    const start = (page - 1) * limit;
    const items = result.slice(start, start + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public getAll(): EnterpriseDocumentMetadata[] {
    return this.documents;
  }

  public update(
    id: string,
    updates: Partial<EnterpriseDocumentMetadata>
  ): EnterpriseDocumentMetadata | undefined {
    const doc = this.getById(id);
    if (!doc) return undefined;

    Object.assign(doc, updates, { updated_at: new Date().toISOString() });

    if (updates.status) {
      query(`UPDATE documents SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [
        updates.status,
        id,
      ]).catch((err) => console.error('❌ Failed to update document status in PostgreSQL:', err));
    }

    return doc;
  }

  public toDocumentRecord(metadata: EnterpriseDocumentMetadata): DocumentRecord {
    return {
      id: metadata.document_id,
      filename: metadata.display_name || metadata.original_filename,
      originalName: metadata.original_filename,
      mimeType: metadata.mime_type,
      size: metadata.size,
      status: metadata.status,
      uploadDate: metadata.created_at,
      chunkCount: 0,
      embeddingStatus: 'Not Started',
      vectorStatus: 'Not Indexed',
      storagePath: metadata.cloudinary_url,
      cloudinary_url: metadata.cloudinary_url,
      cloudinary_public_id: metadata.cloudinary_public_id,
      metadata: {
        title: metadata.title || metadata.original_filename,
        description: metadata.description,
        tags: metadata.tags || [],
        department: metadata.department,
        visibility: metadata.visibility,
        version: metadata.version,
        language: metadata.language,
        author: metadata.author,
        createdDate: metadata.created_at,
        modifiedDate: metadata.updated_at,
        source: 'Cloudinary',
        documentType: metadata.extension,
        checksum: metadata.hash,
      },
    };
  }

  public deleteDocument(id: string): boolean {
    const initialLen = this.documents.length;
    this.documents = this.documents.filter((d) => d.document_id !== id && (d as any).id !== id);

    query(`DELETE FROM documents WHERE id = $1`, [id]).catch((err) =>
      console.error('❌ Failed to delete document from PostgreSQL:', err)
    );

    return this.documents.length !== initialLen;
  }

  public softDelete(id: string): boolean {
    const doc = this.getById(id);
    if (!doc) return false;

    doc.is_active = false;
    doc.status = 'Deleted' as any;
    doc.deleted_at = new Date().toISOString();

    query(`UPDATE documents SET status = 'Deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [
      id,
    ]).catch((err) => console.error('❌ Failed to soft-delete document in PostgreSQL:', err));

    return true;
  }

  public restore(id: string): boolean {
    const doc = this.documents.find((d) => d.document_id === id || (d as any).id === id);
    if (!doc) return false;

    doc.is_active = true;
    doc.status = 'Ready';
    doc.deleted_at = null;

    query(`UPDATE documents SET status = 'Ready', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [
      id,
    ]).catch((err) => console.error('❌ Failed to restore document in PostgreSQL:', err));

    return true;
  }

  public analyzeRuleBasedMetadata(text: string, pageCount: number = 1): NLPMetadataPayload {
    const lines = text.split('\n');
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
    const charCount = text.length;
    const wordCount = words.length;

    let extractedTitle: string | null = null;
    for (const line of lines) {
      const clean = line.trim().replace(/^#+\s*/, '');
      if (clean.length > 3 && clean.length < 120) {
        extractedTitle = clean;
        break;
      }
    }

    const headings: string[] = [];
    const sections: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) {
        headings.push(trimmed.replace(/^#+\s*/, ''));
      } else if (/^[A-Z0-9\s._-]{3,50}:$/.test(trimmed)) {
        sections.push(trimmed.replace(':', ''));
      }
    }

    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const avgWordLen = wordCount > 0 ? charCount / wordCount : 0;
    const sentenceCount = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    const avgSentenceLen = sentenceCount > 0 ? wordCount / sentenceCount : 0;

    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    return {
      language: 'en',
      page_count: pageCount,
      word_count: wordCount,
      character_count: charCount,
      reading_time: wordCount === 0 ? '0.00 mins' : `${readTimeMinutes} mins`,
      title: extractedTitle,
      headings,
      sections,
      paragraph_count: paragraphs.length,
      file_statistics: {
        line_count: lines.length,
        avg_word_length: parseFloat(avgWordLen.toFixed(1)),
        avg_sentence_length: parseFloat(avgSentenceLen.toFixed(1)),
      },
    };
  }
}

export const metadataService = new MetadataService();
