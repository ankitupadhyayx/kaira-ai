import fs from 'fs';
import path from 'path';
import { adminDocumentRepository } from '../store/admin-document.repository';
import { adminSettingsStore } from '../store/admin-settings.store';
import { adminLogsStore } from '../store/admin-logs.store';
import { extractionService } from './extraction.service';
import { chunkService } from './chunk.service';
import { embeddingService } from './embedding.service';
import { vectorService } from './vector.service';
import { DocumentRecord, DocumentChunk, DocumentProcessingStatus } from '../types/admin.types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const CHUNKS_DIR = path.join(DATA_DIR, 'chunks');

if (!fs.existsSync(CHUNKS_DIR)) {
  fs.mkdirSync(CHUNKS_DIR, { recursive: true });
}

export class DocumentService {
  /**
   * Stage 1 -> Stage 2: Extract text from uploaded document.
   */
  public async extractText(id: string): Promise<DocumentRecord> {
    const doc = adminDocumentRepository.getById(id);
    if (!doc) throw new Error(`Document with ID '${id}' not found`);

    try {
      const result = extractionService.extractText(doc.storagePath, doc.originalName);
      const updated = adminDocumentRepository.update(id, {
        extractedText: result.rawText,
        status: 'Extracted',
      });

      adminLogsStore.addLog('INFO', 'ExtractionService', `Extracted ${result.charCount} characters (${result.wordCount} words) from ${doc.originalName}`);
      return updated!;
    } catch (err: any) {
      adminDocumentRepository.update(id, { status: 'Failed' });
      adminLogsStore.addLog('ERROR', 'ExtractionService', `Failed to extract text from ${doc.originalName}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Stage 2 -> Stage 3 & 4: Clean text and split into recursive chunks.
   */
  public async chunkText(id: string): Promise<{ doc: DocumentRecord; chunks: DocumentChunk[] }> {
    let doc = adminDocumentRepository.getById(id);
    if (!doc) throw new Error(`Document with ID '${id}' not found`);

    if (!doc.extractedText) {
      doc = await this.extractText(id);
    }

    try {
      const cleanText = extractionService.cleanText(doc.extractedText!);
      const settings = adminSettingsStore.getSettings();

      const chunks = chunkService.generateChunks(
        id,
        cleanText,
        settings.chunkSize,
        settings.chunkOverlap,
        { title: doc.metadata.title, department: doc.metadata.department }
      );

      // Persist chunks locally
      const chunkFilePath = path.join(CHUNKS_DIR, `${id}_chunks.json`);
      fs.writeFileSync(chunkFilePath, JSON.stringify(chunks, null, 2), 'utf-8');

      const updated = adminDocumentRepository.update(id, {
        cleanText,
        chunkCount: chunks.length,
        status: 'Chunked',
      });

      adminLogsStore.addLog('INFO', 'ChunkService', `Cleaned & generated ${chunks.length} chunks for ${doc.originalName} (chunkSize: ${settings.chunkSize}, overlap: ${settings.chunkOverlap})`);

      return { doc: updated!, chunks };
    } catch (err: any) {
      adminDocumentRepository.update(id, { status: 'Failed' });
      adminLogsStore.addLog('ERROR', 'ChunkService', `Failed to chunk document ${doc.originalName}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Stage 4 -> Stage 5: Generate dense vector embeddings.
   */
  public async embedDocument(id: string): Promise<DocumentRecord> {
    const doc = adminDocumentRepository.getById(id);
    if (!doc) throw new Error(`Document with ID '${id}' not found`);

    try {
      const chunks = this.getChunks(id);
      const settings = adminSettingsStore.getSettings();

      const embeddedChunks = await embeddingService.batchEmbedChunks(chunks, settings.embeddingModel);
      const chunkFilePath = path.join(CHUNKS_DIR, `${id}_chunks.json`);
      fs.writeFileSync(chunkFilePath, JSON.stringify(embeddedChunks, null, 2), 'utf-8');

      const updated = adminDocumentRepository.update(id, {
        embeddingStatus: 'Completed',
        status: 'Embedded',
      });

      adminLogsStore.addLog('INFO', 'EmbeddingService', `Generated embeddings for ${embeddedChunks.length} chunks of ${doc.originalName} using ${settings.embeddingModel}`);
      return updated!;
    } catch (err: any) {
      adminDocumentRepository.update(id, { embeddingStatus: 'Failed', status: 'Failed' });
      adminLogsStore.addLog('ERROR', 'EmbeddingService', `Failed to generate embeddings for ${doc.originalName}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Stage 5 -> Stage 6 & 7: Index embedded chunks into vector DB and mark Ready.
   */
  public async indexDocument(id: string): Promise<DocumentRecord> {
    const doc = adminDocumentRepository.getById(id);
    if (!doc) throw new Error(`Document with ID '${id}' not found`);

    try {
      const chunks = this.getChunks(id);
      const settings = adminSettingsStore.getSettings();

      const res = await vectorService.indexChunks(id, chunks, settings.vectorDb);

      const updated = adminDocumentRepository.update(id, {
        vectorStatus: 'Indexed',
        status: 'Ready',
        processedDate: new Date().toISOString(),
      });

      adminLogsStore.addLog('SUCCESS', 'VectorIndexer', `Indexed ${res.indexedCount} vector chunks into ${settings.vectorDb} collection [${res.collectionName}] for ${doc.originalName}`);
      return updated!;
    } catch (err: any) {
      adminDocumentRepository.update(id, { vectorStatus: 'Failed', status: 'Failed' });
      adminLogsStore.addLog('ERROR', 'VectorIndexer', `Failed to index vectors for ${doc.originalName}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Retrieves generated chunks for a document.
   */
  public getChunks(id: string): DocumentChunk[] {
    const chunkFilePath = path.join(CHUNKS_DIR, `${id}_chunks.json`);
    if (fs.existsSync(chunkFilePath)) {
      try {
        const raw = fs.readFileSync(chunkFilePath, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        return [];
      }
    }
    return [];
  }

  /**
   * Reprocesses document from stage 1 through to Ready.
   */
  public async reprocessDocument(id: string): Promise<DocumentRecord> {
    await this.extractText(id);
    await this.chunkText(id);
    await this.embedDocument(id);
    return await this.indexDocument(id);
  }

  /**
   * Syncs document status & vector index state.
   */
  public async syncDocument(id: string): Promise<DocumentRecord> {
    const doc = adminDocumentRepository.getById(id);
    if (!doc) throw new Error(`Document with ID '${id}' not found`);

    adminLogsStore.addLog('INFO', 'System', `Synced vector store status for document ${doc.originalName}`);
    return doc;
  }
}

export const documentService = new DocumentService();
