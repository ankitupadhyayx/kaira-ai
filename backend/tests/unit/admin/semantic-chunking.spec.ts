import { chunkService } from '../../../src/admin/services/chunk.service';

describe('Enterprise Semantic Chunking Execution Suite', () => {
  const sampleMarkdownDoc = `
# Mobiloitte Engineering Handbook

## 1. Overview
Mobiloitte Technologies is an AI-first software engineering company founded in 2004.

## 2. Technology Stack & Frameworks

### 2.1 Web Development
We build web applications using React, Next.js, Node.js, and TypeScript.

### 2.2 Table of Core Services
| Service | Primary Stack | Delivery Model |
| --- | --- | --- |
| Mobile Engineering | iOS, Android, Flutter | Agile |
| AI & LLM Solutions | Gemini, OpenAI, PyTorch | Dedicated Team |
| Cloud Infrastructure | AWS, Azure, GCP | DevOps SRE |

### 2.3 Code Sample
\`\`\`typescript
export function initializeApp(): string {
  return "Mobiloitte AI Agent Initialized";
}
\`\`\`

## 3. Benefits & Policies
- 26 weeks paid maternity leave
- Comprehensive health cover
- Flexible WFH policy
`;

  it('generates chunks with semantic boundary protection (tables, code, lists)', () => {
    const chunks = chunkService.generateChunks('doc_qa_test', sampleMarkdownDoc, 400, 50, {
      title: 'Engineering Handbook',
      department: 'Technology',
    });

    expect(chunks.length).toBeGreaterThan(0);

    // Check table detection
    const tableChunk = chunks.find((c) => c.metadata.has_table);
    expect(tableChunk).toBeDefined();
    expect(tableChunk?.metadata.semantic_type).toBe('table');

    // Check code detection
    const codeChunk = chunks.find((c) => c.metadata.contains_code);
    expect(codeChunk).toBeDefined();
    expect(codeChunk?.metadata.semantic_type).toBe('code');

    // Check list detection
    const listChunk = chunks.find((c) => c.metadata.has_list);
    expect(listChunk).toBeDefined();
  });

  it('populates extended semantic metadata fields correctly', () => {
    const chunks = chunkService.generateChunks('doc_qa_test_meta', sampleMarkdownDoc, 500, 50, {
      title: 'Engineering Handbook',
    });

    const first = chunks[0];
    const last = chunks[chunks.length - 1];

    expect(first.metadata.is_first_chunk).toBe(true);
    expect(last.metadata.is_last_chunk).toBe(true);
    expect(first.metadata).toHaveProperty('content_hash');
    expect(first.metadata).toHaveProperty('parent_heading');
    expect(first.metadata).toHaveProperty('heading_level');
  });

  it('validates chunk quality gate', () => {
    const valid = chunkService.validateChunk({
      chunk_id: 'c1',
      document_id: 'd1',
      chunk_index: 0,
      page_number: 1,
      section: 'Sec',
      heading: 'Head',
      content: 'Valid content text longer than 15 chars',
      metadata: {},
      created_at: new Date().toISOString(),
    });
    expect(valid.valid).toBe(true);

    const invalidShort = chunkService.validateChunk({
      chunk_id: 'c2',
      document_id: 'd1',
      chunk_index: 1,
      page_number: 1,
      section: 'Sec',
      heading: 'Head',
      content: 'Short',
      metadata: {},
      created_at: new Date().toISOString(),
    });
    expect(invalidShort.valid).toBe(false);
  });

  it('builds hierarchical tree map for future graph/tree retrieval readiness', () => {
    const chunks = chunkService.generateChunks('doc_tree_test', sampleMarkdownDoc, 500, 50, {
      title: 'Engineering Handbook',
    });

    const tree = chunkService.buildHierarchicalTreeMap(chunks);
    expect(tree.length).toBeGreaterThan(0);
    expect(tree[0]).toHaveProperty('heading');
    expect(tree[0]).toHaveProperty('level');
    expect(tree[0]).toHaveProperty('childChunkIds');
  });
});
