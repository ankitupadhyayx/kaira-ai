import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface ChunkConfigOptions {
  chunkSize: number;
  chunkOverlap: number;
  batchSize: number;
  timeoutMs: number;
  separators: string[];
  minChunkLength: number;
  orphanLookback: number;
}

export class ChunkConfig {
  public static get(): ChunkConfigOptions {
    const chunkSize = parseInt(process.env.CHUNK_SIZE || '600', 10);
    const chunkOverlap = parseInt(process.env.CHUNK_OVERLAP || '100', 10);
    const batchSize = parseInt(process.env.BATCH_SIZE || '50', 10);
    const timeoutMs = parseInt(process.env.TIMEOUT_MS || '15000', 10);

    return {
      chunkSize: isNaN(chunkSize) ? 600 : chunkSize,
      chunkOverlap: isNaN(chunkOverlap) ? 100 : chunkOverlap,
      batchSize: isNaN(batchSize) ? 50 : batchSize,
      timeoutMs: isNaN(timeoutMs) ? 15000 : timeoutMs,
      minChunkLength: 15,
      orphanLookback: 120,
      separators: [
        '\n# ',
        '\n## ',
        '\n### ',
        '\n1. ',
        '\n2. ',
        '\n\n',
        '\n',
        '\n• ',
        '\n- ',
        '. ',
        '? ',
        '! ',
        ' ',
      ],
    };
  }
}
