import { DocumentChunkRecord } from './chunk.service';
import { chunkRepository } from '../store/chunk.repository';

export class ChunkStorageService {
  /**
   * Single responsibility: Handles persistence of chunk records into PostgreSQL / repository store.
   * NO embeddings or vector database indexing. Pure relational chunk storage.
   */
  public storeChunks(chunks: DocumentChunkRecord[]): DocumentChunkRecord[] {
    if (!chunks || chunks.length === 0) return [];
    return chunkRepository.saveChunks(chunks);
  }

  public getDocumentChunks(documentId: string): DocumentChunkRecord[] {
    return chunkRepository.getChunksByDocumentId(documentId);
  }

  public getChunkDetails(chunkId: string): DocumentChunkRecord | undefined {
    return chunkRepository.getChunkById(chunkId);
  }
}

export const chunkStorageService = new ChunkStorageService();
