import { ChunkConfig } from '../../../src/admin/config/chunk.config';
import { chunkService } from '../../../src/admin/services/chunk.service';
import { chunkStorageService } from '../../../src/admin/services/chunk-storage.service';
import { chunkRepository } from '../../../src/admin/store/chunk.repository';

describe('RecursiveCharacterTextSplitter Chunking & PostgreSQL Storage', () => {
  describe('1. Configuration & Environment Isolation', () => {
    it('ChunkConfig loads dynamic environment variables (CHUNK_SIZE=600, CHUNK_OVERLAP=100)', () => {
      const config = ChunkConfig.get();
      expect(config.chunkSize).toBe(600);
      expect(config.chunkOverlap).toBe(100);
      expect(Array.isArray(config.separators)).toBe(true);
      expect(config.separators).toContain('\n\n');
    });
  });

  describe('2. RecursiveCharacterTextSplitter & Section Context Tracking', () => {
    it('Splits Markdown documents with mixed headings while tracking active section context', () => {
      const sampleText =
        `# Enterprise AI Architecture Guide\n\n` +
        `## 1. Executive Summary\n` +
        `Mobiloitte provides deterministic enterprise AI solution architecture with zero latency FastPath response routing.\n\n` +
        `## 2. Core System Components\n` +
        `The platform is built using Node.js microservices and Next.js frontend interfaces.\n\n` +
        `### 2.1 Microservices Infrastructure\n` +
        `High performance Express gateway handling authorization and rate limiting.`;

      const chunks = chunkService.generateChunks('doc-chunk-test', sampleText, 600, 100, {
        title: 'Enterprise AI Architecture Guide',
        department: 'AI Practice',
      });

      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBeGreaterThan(0);

      const firstChunk = chunks[0];
      expect(firstChunk.chunk_id).toContain('chunk_doc-chunk-test_');
      expect(firstChunk.document_id).toBe('doc-chunk-test');
      expect(firstChunk.page_number).toBeGreaterThan(0);
      expect(firstChunk.heading).toBeDefined();
      expect(firstChunk.section).toBeDefined();
      expect(firstChunk.content).toContain('Enterprise AI');
      expect(firstChunk.metadata.title).toBe('Enterprise AI Architecture Guide');
      expect(firstChunk.metadata.department).toBe('AI Practice');
    });

    it('Respects maximum chunk size limit (~2400 chars) and enforces overlap', () => {
      const longText = Array(300).fill('Enterprise AI platform deterministic FastPath response routing. ').join('\n');
      const chunks = chunkService.generateChunks('doc-large-test', longText, 600, 100);

      expect(chunks.length).toBeGreaterThan(1);

      for (let i = 0; i < chunks.length; i++) {
        expect(chunks[i].content.length).toBeLessThanOrEqual(2500); // 600 tokens approx 2400 chars
      }

      // Check overlap: end of chunk 0 overlaps with start of chunk 1
      const text0 = chunks[0].content;
      const text1 = chunks[1].content;
      const overlapSnippet = text0.substring(text0.length - 100);
      expect(text1).toContain(overlapSnippet.trim());
    });

    it('Splits lists and CSV tabular data into recursive chunks cleanly', () => {
      const csvData = Array(50).fill('ID,Name,Role,Department\n101,Alice,Architect,AI\n102,Bob,Engineer,Dev').join('\n');
      const chunks = chunkService.generateChunks('doc-csv-test', csvData, 600, 100);

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].content).toContain('Alice,Architect');
    });
  });

  describe('3. PostgreSQL Chunk Storage & Repository', () => {
    it('Generates valid PostgreSQL DDL table definition schema', () => {
      const ddl = chunkRepository.getPostgresDDL();
      expect(ddl).toContain('CREATE TABLE IF NOT EXISTS document_chunks');
      expect(ddl).toContain('chunk_id VARCHAR(100) PRIMARY KEY');
      expect(ddl).toContain('page_number INT DEFAULT 1');
      expect(ddl).toContain('section VARCHAR(255)');
      expect(ddl).toContain('metadata JSONB NOT NULL');
    });

    it('ChunkStorageService persists generated chunk records to store', () => {
      const testChunks = chunkService.generateChunks('doc-store-test', 'Sample content for storage test', 600, 100);
      const stored = chunkStorageService.storeChunks(testChunks);

      expect(stored.length).toBe(testChunks.length);

      const retrieved = chunkStorageService.getDocumentChunks('doc-store-test');
      expect(retrieved.length).toBe(testChunks.length);
      expect(retrieved[0].content).toContain('Sample content for storage test');
    });
  });
});
