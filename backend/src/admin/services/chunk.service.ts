import { ChunkConfig } from '../config/chunk.config';
import crypto from 'crypto';

export interface DocumentChunkRecord {
  chunk_id: string;
  document_id: string;
  chunk_index: number;
  page_number: number;
  section: string;
  heading: string;
  content: string;
  metadata: {
    title?: string;
    department?: string;
    token_count?: number;
    char_count?: number;
    start_offset?: number;
    end_offset?: number;
    // Optional Extended Semantic Metadata
    parent_heading?: string;
    heading_level?: number;
    semantic_type?: 'heading' | 'paragraph' | 'list' | 'table' | 'code' | 'general';
    paragraph_number?: number;
    document_language?: string;
    is_first_chunk?: boolean;
    is_last_chunk?: boolean;
    has_table?: boolean;
    has_list?: boolean;
    contains_code?: boolean;
    content_hash?: string;
    [key: string]: any;
  };
  created_at: string;
  id?: string;
  tokenCount?: number;
}

export class ChunkService {
  /**
   * Scans document text to build an index of section and heading markers with hierarchy level & offset.
   */
  private buildHeadingIndex(
    text: string,
    defaultTitle: string
  ): Array<{ offset: number; section: string; heading: string; parentHeading?: string; level: number }> {
    const headingIndex: Array<{ offset: number; section: string; heading: string; parentHeading?: string; level: number }> = [];
    const lines = text.split('\n');
    let currentOffset = 0;

    let activeSection = defaultTitle || 'General';
    let activeHeading = defaultTitle || 'Overview';
    let parentHeading = defaultTitle || 'General';
    let currentLevel = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      const markdownMatch = line.match(/^(#{1,6})\s+(.+)$/);
      const numberedMatch = line.match(/^(\d+(?:\.\d+)*\.?\s+)([A-Z0-9].*)$/);
      const sectionMatch = line.match(/^(Section|Phase|Part|Chapter)\s+([A-Z0-9]+[:\.\s]+.+)$/i);

      if (markdownMatch && markdownMatch[2]) {
        const hashCount = markdownMatch[1].length;
        const title = markdownMatch[2].trim();
        
        if (hashCount <= 2) {
          parentHeading = activeSection;
          activeSection = title;
        } else {
          parentHeading = activeSection;
        }
        
        activeHeading = title;
        currentLevel = hashCount;

        headingIndex.push({
          offset: currentOffset,
          section: activeSection,
          heading: activeHeading,
          parentHeading,
          level: currentLevel,
        });
      } else if (numberedMatch && numberedMatch[2]) {
        const fullTitle = line.trim();
        const cleanTitle = numberedMatch[2].trim();
        if (/^\d+\.\s+[A-Z]/.test(line)) {
          parentHeading = activeSection;
          activeSection = fullTitle;
        }
        activeHeading = cleanTitle;
        currentLevel = 2;

        headingIndex.push({
          offset: currentOffset,
          section: activeSection,
          heading: activeHeading,
          parentHeading,
          level: currentLevel,
        });
      } else if (sectionMatch) {
        const fullTitle = line.trim();
        parentHeading = activeSection;
        activeSection = fullTitle;
        activeHeading = fullTitle;
        currentLevel = 1;

        headingIndex.push({
          offset: currentOffset,
          section: activeSection,
          heading: activeHeading,
          parentHeading,
          level: currentLevel,
        });
      } else if (
        line.length > 3 &&
        line.length < 50 &&
        !line.endsWith('.') &&
        !line.endsWith(':') &&
        /^[A-Z][A-Za-z0-9\s,&-]+$/.test(line) &&
        (i === 0 || lines[i - 1].trim().length === 0)
      ) {
        activeHeading = line;
        currentLevel = 3;
        headingIndex.push({
          offset: currentOffset,
          section: activeSection,
          heading: activeHeading,
          parentHeading,
          level: currentLevel,
        });
      }

      currentOffset += lines[i].length + 1; // +1 for \n
    }

    return headingIndex;
  }

  /**
   * Generates clean, semantically bounded chunks with block protection (Tables, Code, Lists).
   */
  public generateChunks(
    documentId: string,
    normalizedText: string,
    overrideChunkSize?: number,
    overrideChunkOverlap?: number,
    docMetadata?: {
      title?: string;
      department?: string;
      language?: string;
      visibility?: string;
      author?: string;
      version?: string;
      source?: string;
      document_type?: string;
    }
  ): DocumentChunkRecord[] {
    const startTimeMs = Date.now();
    if (!normalizedText || typeof normalizedText !== 'string' || normalizedText.trim().length === 0) {
      return [];
    }

    const config = ChunkConfig.get();
    const chunkSize = overrideChunkSize || config.chunkSize;
    const chunkOverlap = overrideChunkOverlap || config.chunkOverlap;

    const charChunkSize = Math.max(100, chunkSize);
    const charOverlap = Math.max(0, Math.min(chunkOverlap, Math.floor(charChunkSize / 2)));

    const docTitle = docMetadata?.title || 'General';
    const headingIndex = this.buildHeadingIndex(normalizedText, docTitle);

    const rawChunks: Array<{
      content: string;
      startOffset: number;
      endOffset: number;
      section: string;
      heading: string;
      parentHeading?: string;
      level?: number;
      pageNumber: number;
    }> = [];

    const separators = ['\n\n', '\n', '. ', '? ', '! ', ', ', ' '];
    let startOffset = 0;
    let paragraphCounter = 1;

    while (startOffset < normalizedText.length) {
      let endOffset = Math.min(normalizedText.length, startOffset + charChunkSize);

      if (endOffset < normalizedText.length) {
        let bestBreak = -1;

        // 1. Evaluate natural semantic separators
        for (const sep of separators) {
          const idx = normalizedText.lastIndexOf(sep, endOffset);
          if (idx > startOffset + Math.floor(charChunkSize * 0.3)) {
            bestBreak = idx + sep.length;
            break;
          }
        }

        if (bestBreak !== -1) {
          endOffset = bestBreak;
        }

        // 2. Block Boundary Protection: Prevent splitting inside Markdown Tables or Code Blocks
        const snippet = normalizedText.substring(startOffset, endOffset);
        
        // Code Block Protection: Check if we opened a code block without closing it
        const backtickMatches = snippet.match(/```/g);
        if (backtickMatches && backtickMatches.length % 2 !== 0) {
          const closingCodePos = normalizedText.indexOf('```', endOffset);
          if (closingCodePos !== -1 && closingCodePos - startOffset <= charChunkSize * 1.6) {
            endOffset = closingCodePos + 3;
          }
        }

        // Table Boundary Protection: Check if split point lands in the middle of a markdown table row
        const snippetLines = snippet.split('\n');
        const lastLine = snippetLines[snippetLines.length - 1];
        if (lastLine && lastLine.includes('|') && !lastLine.trim().endsWith('|')) {
          const lineEndPos = normalizedText.indexOf('\n', endOffset);
          if (lineEndPos !== -1 && lineEndPos - startOffset <= charChunkSize * 1.4) {
            endOffset = lineEndPos + 1;
          }
        }

        // 3. Heading Awareness: Prevent orphaned headings at end of chunk
        const endLookback = config.orphanLookback || 120;
        const lookbackStart = Math.max(startOffset, endOffset - endLookback);
        const endSnippet = normalizedText.substring(lookbackStart, endOffset);
        const orphanMatch = endSnippet.match(/\n(#{1,6}\s+|(?:\d+\.)+\s+|[A-Z0-9\s._-]{3,40}:)/);
        if (orphanMatch && orphanMatch.index !== undefined) {
          const orphanPos = lookbackStart + orphanMatch.index;
          if (orphanPos > startOffset + Math.floor(charChunkSize * 0.4)) {
            endOffset = orphanPos;
          }
        }
      }

      const chunkContent = normalizedText.substring(startOffset, endOffset).trim();

      // Find active section & heading from heading index at this offset
      let currentSection = docTitle;
      let currentHeading = docTitle;
      let parentHeading: string | undefined = docTitle;
      let headingLevel = 1;

      for (let i = headingIndex.length - 1; i >= 0; i--) {
        if (headingIndex[i].offset <= startOffset + Math.floor(chunkContent.length * 0.5)) {
          currentSection = headingIndex[i].section;
          currentHeading = headingIndex[i].heading;
          parentHeading = headingIndex[i].parentHeading;
          headingLevel = headingIndex[i].level;
          break;
        }
      }

      // Page estimation based on line offset
      const textBefore = normalizedText.substring(0, startOffset);
      const lineOffset = textBefore.split('\n').length;
      const currentPage = Math.max(1, Math.ceil(lineOffset / 45));

      if (chunkContent.length > 0) {
        rawChunks.push({
          content: chunkContent,
          startOffset,
          endOffset,
          section: currentSection,
          heading: currentHeading,
          parentHeading,
          level: headingLevel,
          pageNumber: currentPage,
        });
      }

      startOffset = endOffset - charOverlap;
      if (startOffset >= normalizedText.length || endOffset >= normalizedText.length) {
        break;
      }
    }

    // Step 4: Enrich Metadata & Validate Chunks
    const validChunks: DocumentChunkRecord[] = [];
    const seenContentHashes = new Set<string>();
    let duplicateCount = 0;
    let validationErrorCount = 0;

    const totalRaw = rawChunks.length;

    for (let i = 0; i < totalRaw; i++) {
      const raw = rawChunks[i];
      const approxTokenCount = Math.ceil(raw.content.length / 4);
      const chunkId = `chunk_${documentId}_${i}`;

      const contentHash = crypto.createHash('sha256').update(raw.content).digest('hex').substring(0, 16);

      if (seenContentHashes.has(contentHash)) {
        duplicateCount++;
        continue;
      }
      seenContentHashes.add(contentHash);

      const hasTable = /\|[\s\S]+\|[\s\S]+\|/.test(raw.content);
      const hasList = /^[\s]*[•\*\-\d+\.]\s+/m.test(raw.content);
      const containsCode = /```|function\s+|const\s+|let\s+|import\s+/i.test(raw.content);

      let semanticType: DocumentChunkRecord['metadata']['semantic_type'] = 'general';
      if (/```/.test(raw.content)) semanticType = 'code';
      else if (hasTable) semanticType = 'table';
      else if (containsCode) semanticType = 'code';
      else if (hasList) semanticType = 'list';
      else if (/^#{1,6}\s+/.test(raw.content)) semanticType = 'heading';
      else if (raw.content.length > 50) semanticType = 'paragraph';

      const chunkRecord: DocumentChunkRecord = {
        chunk_id: chunkId,
        document_id: documentId,
        chunk_index: validChunks.length,
        page_number: raw.pageNumber,
        section: raw.section,
        heading: raw.heading,
        content: raw.content,
        metadata: {
          title: docTitle,
          department: docMetadata?.department || 'General Operations',
          language: docMetadata?.language || 'en',
          visibility: docMetadata?.visibility || 'Internal',
          author: docMetadata?.author || 'System Admin',
          version: docMetadata?.version || 'Version 1',
          source: docMetadata?.source || 'Cloudinary',
          document_type: docMetadata?.document_type || 'PDF',
          token_count: approxTokenCount,
          char_count: raw.content.length,
          start_offset: raw.startOffset,
          end_offset: raw.endOffset,
          // Extended Semantic Metadata
          parent_heading: raw.parentHeading,
          heading_level: raw.level || 1,
          semantic_type: semanticType,
          paragraph_number: paragraphCounter++,
          document_language: docMetadata?.language || 'en',
          is_first_chunk: i === 0,
          is_last_chunk: i === totalRaw - 1,
          has_table: hasTable,
          has_list: hasList,
          contains_code: containsCode,
          content_hash: contentHash,
        },
        created_at: new Date().toISOString(),
        id: chunkId,
        tokenCount: approxTokenCount,
      };

      const validation = this.validateChunk(chunkRecord);
      if (validation.valid) {
        validChunks.push(chunkRecord);
      } else {
        validationErrorCount++;
      }
    }

    // Step 5: Telemetry Logging Summary
    const durationMs = Date.now() - startTimeMs;
    const avgSize = validChunks.length > 0 ? Math.round(validChunks.reduce((acc, c) => acc + c.content.length, 0) / validChunks.length) : 0;
    const avgTokens = validChunks.length > 0 ? Math.round(validChunks.reduce((acc, c) => acc + (c.tokenCount || 0), 0) / validChunks.length) : 0;

    if (process.env.NODE_ENV !== 'test') {
      console.log('[SemanticChunkingPipeline] Summary:', {
        documentId,
        chunkCount: validChunks.length,
        avgChunkSize: avgSize,
        avgTokenCount: avgTokens,
        processingTimeMs: durationMs,
        validationErrors: validationErrorCount,
        duplicateCount,
        headingCount: headingIndex.length,
      });
    }

    return validChunks;
  }

  /**
   * Quality Validation Gate: Validates chunk completeness and integrity.
   */
  public validateChunk(chunk: DocumentChunkRecord): { valid: boolean; reason?: string } {
    if (!chunk || !chunk.content || chunk.content.trim().length === 0) {
      return { valid: false, reason: 'Empty content' };
    }
    if (chunk.content.trim().length < (ChunkConfig.get().minChunkLength || 15)) {
      return { valid: false, reason: 'Content below minimum character threshold' };
    }
    if (!chunk.chunk_id || !chunk.document_id) {
      return { valid: false, reason: 'Missing chunk_id or document_id' };
    }
    return { valid: true };
  }

  /**
   * Extension Hook: Hierarchical Tree Map Builder for Graph/Tree Retrieval readiness.
   */
  public buildHierarchicalTreeMap(chunks: DocumentChunkRecord[]): Array<{ heading: string; level: number; childChunkIds: string[] }> {
    const treeMap: Map<string, { heading: string; level: number; childChunkIds: string[] }> = new Map();

    for (const chunk of chunks) {
      const heading = chunk.heading || 'General';
      const level = chunk.metadata?.heading_level || 1;

      if (!treeMap.has(heading)) {
        treeMap.set(heading, { heading, level, childChunkIds: [] });
      }
      treeMap.get(heading)!.childChunkIds.push(chunk.chunk_id);
    }

    return Array.from(treeMap.values());
  }

  /**
   * Extension Hook: Semantic Chunking Strategy Override.
   */
  public applySemanticChunkingStrategy(text: string): string[] {
    return text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  }
}

export const chunkService = new ChunkService();
