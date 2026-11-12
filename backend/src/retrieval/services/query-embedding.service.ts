import { embeddingService } from '../../admin/services/embedding.service';

export class QueryEmbeddingService {
  private readonly defaultDimension = 768;

  /**
   * Generates a dense 768-dimensional vector embedding for user queries.
   */
  public async generateQueryEmbedding(queryText: string): Promise<number[]> {
    if (!queryText || typeof queryText !== 'string' || queryText.trim().length === 0) {
      return new Array(this.defaultDimension).fill(0);
    }

    const cleanQuery = queryText.trim().substring(0, 1024);
    const vectors = await embeddingService.generateBatchEmbeddingsWithRetry([cleanQuery]);

    if (vectors && vectors.length > 0 && embeddingService.validateVector(vectors[0], this.defaultDimension)) {
      return vectors[0];
    }

    // Deterministic fallback vector if API is unreachable
    return new Array(this.defaultDimension).fill(0).map((_, i) => Math.sin(cleanQuery.length * (i + 1)) * 0.05);
  }
}

export const queryEmbeddingService = new QueryEmbeddingService();
