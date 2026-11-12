import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface RetrievalConfigOptions {
  topKDefault: number;
  topKMin: number;
  topKMax: number;
  similarityThreshold: number;
  defaultLanguage: string;
  defaultVisibility: string;
  defaultVersion: string;
}

export class RetrievalConfig {
  public static get(): RetrievalConfigOptions {
    const topKDefault = parseInt(process.env.TOP_K_DEFAULT || '5', 10);
    const topKMin = parseInt(process.env.TOP_K_MIN || '3', 10);
    const topKMax = parseInt(process.env.TOP_K_MAX || '8', 10);
    const similarityThreshold = parseFloat(process.env.SIMILARITY_THRESHOLD || '0.70');

    return {
      topKDefault: isNaN(topKDefault) ? 5 : topKDefault,
      topKMin: isNaN(topKMin) ? 3 : topKMin,
      topKMax: isNaN(topKMax) ? 8 : topKMax,
      similarityThreshold: isNaN(similarityThreshold) ? 0.70 : similarityThreshold,
      defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en',
      defaultVisibility: process.env.DEFAULT_VISIBILITY || 'Internal',
      defaultVersion: process.env.DEFAULT_VERSION || 'v1',
    };
  }
}
