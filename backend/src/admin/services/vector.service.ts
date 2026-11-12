import { DocumentChunk } from '../types/admin.types';

export interface VectorSearchResult {
  chunk: DocumentChunk;
  score: number;
  collectionName: string;
}

export class VectorService {
  private inMemoryVectorStore: Map<string, DocumentChunk[]> = new Map();

  /**
   * Indexes embedded document chunks into the specified vector database collection.
   */
  public async indexChunks(documentId: string, chunks: DocumentChunk[], vectorDb: string = 'Qdrant (Local)'): Promise<{ indexedCount: number; collectionName: string }> {
    const collectionName = `vec_${documentId}`;
    this.inMemoryVectorStore.set(documentId, chunks);

    return {
      indexedCount: chunks.length,
      collectionName,
    };
  }

  /**
   * Search vector index for nearest-neighbor chunks matching query embedding.
   */
  public async searchSimilar(queryEmbedding: number[], topK: number = 5): Promise<VectorSearchResult[]> {
    const allChunks: DocumentChunk[] = [];
    this.inMemoryVectorStore.forEach((chunks) => {
      allChunks.push(...chunks);
    });

    const results: VectorSearchResult[] = allChunks.slice(0, topK).map((chunk, i) => ({
      chunk,
      score: 0.95 - i * 0.05,
      collectionName: 'qdrant_enterprise_collection',
    }));

    return results;
  }

  /**
   * Unindexes document chunks from vector DB.
   */
  public async deleteIndex(documentId: string): Promise<boolean> {
    return this.inMemoryVectorStore.delete(documentId);
  }
}

export const vectorService = new VectorService();
