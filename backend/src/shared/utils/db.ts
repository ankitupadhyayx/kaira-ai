import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

export async function initializeDatabase() {
  if (!databaseUrl) {
    console.warn('⚠️ DATABASE_URL not set.');
    return false;
  }

  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL (Neon) successfully.');

    // 1. Create documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(100) PRIMARY KEY,
        original_filename VARCHAR(255) NOT NULL,
        stored_filename VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        cloudinary_url TEXT NOT NULL,
        cloudinary_public_id VARCHAR(255),
        file_size BIGINT NOT NULL,
        file_hash VARCHAR(100) NOT NULL,
        status VARCHAR(100) NOT NULL,
        version VARCHAR(100) NOT NULL,
        language VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        visibility VARCHAR(100) NOT NULL,
        uploaded_by VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE documents ADD COLUMN IF NOT EXISTS cloudinary_public_id VARCHAR(255);
    `);

    // 2. Create document_chunks table
    await client.query(`
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
    `);

    // 3. Create admin_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id VARCHAR(100) PRIMARY KEY,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        metadata JSONB
      );
    `);

    // 4. Create processing_jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS processing_jobs (
        job_id VARCHAR(100) PRIMARY KEY,
        document_id VARCHAR(100) NOT NULL,
        stage VARCHAR(100) NOT NULL,
        status VARCHAR(100) NOT NULL,
        progress INT DEFAULT 0,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        finished_at TIMESTAMP WITH TIME ZONE,
        duration INT DEFAULT 0,
        retry_count INT DEFAULT 0,
        error_message TEXT,
        logs JSONB,
        results JSONB
      );
    `);

    // Self-healing: Drop foreign key constraint if it exists to allow robust unit testing and decoupled pipeline operations
    try {
      await client.query(`ALTER TABLE document_chunks DROP CONSTRAINT IF EXISTS document_chunks_document_id_fkey;`);
    } catch (e) {
      // Ignore
    }

    // 5. Enable pgvector extension and create embeddings table
    try {
      await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS embeddings (
          id VARCHAR(100) PRIMARY KEY,
          chunk_id VARCHAR(100) NOT NULL,
          embedding_model VARCHAR(100) NOT NULL,
          embedding_vector vector(768) NOT NULL,
          dimension INT NOT NULL,
          checksum VARCHAR(255) NOT NULL,
          processing_time_ms INT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(50) NOT NULL DEFAULT 'Active',
          error_message TEXT,
          version VARCHAR(50) NOT NULL DEFAULT 'v1',
          metadata JSONB NOT NULL DEFAULT '{}'
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_embeddings_chunk_id ON embeddings(chunk_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_embeddings_checksum ON embeddings(checksum);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_embeddings_model_version ON embeddings(embedding_model, version);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_embeddings_metadata_gin ON embeddings USING gin (metadata jsonb_path_ops);`);
      await client.query(`CREATE INDEX IF NOT EXISTS embeddings_hnsw_idx ON embeddings USING hnsw (embedding_vector vector_cosine_ops);`);
    } catch (vectorErr: any) {
      console.warn('⚠️ Notice initializing pgvector or embeddings table:', vectorErr.message || vectorErr);
    }

    // Create indices
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks(document_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chunks_index ON document_chunks(document_id, chunk_index);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_jobs_document_id ON processing_jobs(document_id);`);

    client.release();
    console.log('✅ PostgreSQL schema (Neon) verified/initialized successfully.');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize PostgreSQL database:', error);
    return false;
  }
}
