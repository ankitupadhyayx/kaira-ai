import { DocumentChunkRecord } from '../services/chunk.service';
import { query } from '../../shared/utils/db';

export class ChunkRepository {
  private chunks: DocumentChunkRecord[] = [];

  constructor() {
    this.loadChunksFromDb();
  }

  private async loadChunksFromDb(): Promise<void> {
    try {
      const res = await query(`SELECT * FROM document_chunks ORDER BY chunk_index ASC`);
      if (res && res.rows && res.rows.length > 0) {
        this.chunks = res.rows.map((row: any) => ({
          chunk_id: row.chunk_id,
          document_id: row.document_id,
          chunk_index: row.chunk_index,
          page_number: row.page_number,
          section: row.section || '',
          heading: row.heading || '',
          content: row.content,
          metadata: row.metadata || {},
          created_at: new Date(row.created_at).toISOString(),
        }));
      }
    } catch (err) {
      console.warn('⚠️ Could not load initial chunks from Neon PostgreSQL:', err);
    }
  }

  public storeChunks(newChunks: DocumentChunkRecord[]): DocumentChunkRecord[] {
    this.storeChunksAsync(newChunks).catch((err) =>
      console.error(`❌ Asynchronous storeChunks failed:`, err)
    );
    return newChunks;
  }

  public async storeChunksAsync(newChunks: DocumentChunkRecord[]): Promise<DocumentChunkRecord[]> {
    if (!newChunks || newChunks.length === 0) return [];

    const docId = newChunks[0].document_id;

    // Update in-memory cache
    this.chunks = this.chunks.filter((c) => c.document_id !== docId);
    this.chunks.push(...newChunks);

    // Sync to PostgreSQL Neon
    if (process.env.NODE_ENV === 'test') {
      return newChunks;
    }

    try {
      await query(`DELETE FROM document_chunks WHERE document_id = $1`, [docId]);

      for (const chunk of newChunks) {
        const safeSection = (chunk.section || '').substring(0, 250);
        const safeHeading = (chunk.heading || '').substring(0, 250);
        const safeChunkId = (chunk.chunk_id || '').substring(0, 100);
        const safeDocId = (chunk.document_id || '').substring(0, 100);

        await query(
          `INSERT INTO document_chunks (chunk_id, document_id, chunk_index, page_number, section, heading, content, metadata, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (chunk_id) DO UPDATE SET
           content = EXCLUDED.content, metadata = EXCLUDED.metadata`,
          [
            safeChunkId,
            safeDocId,
            chunk.chunk_index,
            chunk.page_number || 1,
            safeSection,
            safeHeading,
            chunk.content,
            JSON.stringify(chunk.metadata || {}),
            new Date(chunk.created_at || new Date()),
          ]
        );
      }
      console.log(`✅ Stored ${newChunks.length} chunks in Neon PostgreSQL document_chunks table.`);
    } catch (err) {
      console.error(`❌ Failed to sync chunks to Neon PostgreSQL for document ${docId}:`, err);
    }

    return newChunks;
  }

  public saveChunks(newChunks: DocumentChunkRecord[]): DocumentChunkRecord[] {
    return this.storeChunks(newChunks);
  }

  public getChunksByDocumentId(documentId: string): DocumentChunkRecord[] {
    return this.chunks.filter((c) => c.document_id === documentId);
  }

  public getChunkById(chunkId: string): DocumentChunkRecord | undefined {
    return this.chunks.find((c) => c.chunk_id === chunkId);
  }

  public deleteChunksByDocumentId(documentId: string): number {
    const initialLen = this.chunks.length;
    this.chunks = this.chunks.filter((c) => c.document_id !== documentId);

    query(`DELETE FROM document_chunks WHERE document_id = $1`, [documentId]).catch((err) =>
      console.error(`❌ Failed to delete chunks for document ${documentId} from PostgreSQL:`, err)
    );

    return initialLen - this.chunks.length;
  }

  public getAllChunks(): DocumentChunkRecord[] {
    return this.chunks;
  }

  public getPostgresDDL(): string {
    return `
CREATE TABLE IF NOT EXISTS document_chunks (
    chunk_id VARCHAR(100) PRIMARY KEY,
    document_id VARCHAR(100) NOT NULL,
    chunk_index INT NOT NULL,
    page_number INT DEFAULT 1,
    section VARCHAR(255),
    heading VARCHAR(255),
    content TEXT NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_index ON document_chunks(document_id, chunk_index);
`.trim();
  }
}

export const chunkRepository = new ChunkRepository();
export const chunkStorageService = chunkRepository;
