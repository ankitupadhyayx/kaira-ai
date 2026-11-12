import dotenv from 'dotenv';
import path from 'path';
import { GenerationInput, GeneratedLLMOutput } from '../types/generation.types';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export class GeminiResponseService {
  private readonly apiKey = process.env.GEMINI_API_KEY || '';
  private readonly modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  /**
   * Gemini Enterprise Mode Response Generation.
   * Generates production-grade, question-driven consultant answers strictly grounded in context.
   */
  public async generateEnterpriseResponse(input: GenerationInput): Promise<GeneratedLLMOutput> {
    const startTime = Date.now();

    if (process.env.NODE_ENV === 'test' || !this.apiKey) {
      return this.getMockEnterpriseOutput(input, startTime);
    }

    try {
      const systemPrompt = `You are Kaira, Senior Enterprise AI Consultant for Mobiloitte. Written as if an experienced employee is answering another employee.

USER QUESTION: ${input.query}

=== PRIMARY DIRECTIVE ===
You are an Enterprise AI Consultant, NOT a document summarizer.
Your job is to answer the USER'S QUESTION FIRST, directly, accurately, and naturally.
The retrieved enterprise context below is REFERENCE EVIDENCE ONLY. It is NOT the response template or final response. Write the response from scratch.

=== THINKING PROCESS ===
1. UNDERSTAND USER INTENT: Determine what information is requested and what is NOT requested. The USER QUESTION always has higher priority than retrieved documents.
2. SELECTIVE EVIDENCE EXTRACTION: Read every retrieved chunk. Identify ONLY the sentences/facts directly relevant to the user's intent. Ignore unrelated sections completely.
3. CONTEXT MERGING: Combine relevant facts from multiple chunks into one seamless, natural answer.
4. REWRITE FROM SCRATCH: Write naturally in human language. Never copy raw chunk text verbatim or expose raw metadata/document headings.

=== QUESTION-DRIVEN RESPONSE FRAMING ===
- "Does / Can Mobiloitte...?" ➔ Start naturally with "Yes. Mobiloitte provides..." or "Yes, Mobiloitte can...". Answer ONLY the requested capability/service. Stop. Never include unasked topics (e.g. if asked about Mobile, NEVER explain AI, Blockchain, Cloud, or Web).
- "Tell me about [Topic]" / "Explain [Concept]" ➔ Answer ONLY the exact topic requested (technologies, frameworks, architecture, frontend, backend, deployment).
- "Which [services/technologies] are supported?" ➔ Start directly with "Mobiloitte supports...".
- Never begin every response with "Mobiloitte provides..." unless that naturally answers the question.

=== STRICT BANS & STYLISTIC RULES ===
1. NO DOCUMENT SUMMARIES: NEVER produce "Overview", "Key Highlights", "References", "Suggested Questions", "Related Topics", "Overview & Details" sections unless explicitly requested.
2. CONFLICT HANDLING: If retrieved chunks do not answer the actual question (e.g., User asks "Mobiloitte laptop policy", but retrieved chunks contain "Company Profile"), DO NOT force an answer using Company Profile. Politely state: "I found information about Mobiloitte as a company, but I couldn't find any document describing its laptop policy."
3. NO CHUNK DUMPING: Never mention "Chunk 1", "Document ID", "Metadata", "Retrieval", or copy headings verbatim.

=== SUPPORTING ENTERPRISE CONTEXT ===
${input.formattedContext}

Your consultant answer:`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1500 },
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const promptTokens = data?.usageMetadata?.promptTokenCount || Math.ceil(systemPrompt.length / 4);
        const completionTokens = data?.usageMetadata?.candidatesTokenCount || Math.ceil((text || '').length / 4);

        if (text && typeof text === 'string') {
          return {
            rawText: text.trim(),
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
            latencyMs: Date.now() - startTime,
          };
        }
      }
    } catch (err: any) {
      console.warn('⚠️ Gemini Enterprise API request notice:', err.message || err);
    }

    return this.getMockEnterpriseOutput(input, startTime);
  }

  /**
   * Gemini Fallback Mode Response Generation.
   * Triggers when no relevant document context passes similarity threshold.
   */
  public async generateFallbackResponse(query: string): Promise<GeneratedLLMOutput> {
    const startTime = Date.now();

    if (process.env.NODE_ENV === 'test' || !this.apiKey) {
      const mockMsg = this.formatNaturalFallbackMessage(query);
      return {
        rawText: mockMsg,
        promptTokens: Math.ceil(query.length / 4),
        completionTokens: Math.ceil(mockMsg.length / 4),
        totalTokens: Math.ceil((query.length + mockMsg.length) / 4),
        latencyMs: Date.now() - startTime,
      };
    }

    try {
      const systemPrompt = `You are Kaira, Mobiloitte's Enterprise AI Assistant.

USER QUESTION: ${query}

No relevant enterprise document or context was found in Mobiloitte's knowledge base for this query.

=== STRICT RESPONSE INSTRUCTIONS ===
1. State clearly and politely in natural language that you do not have information or documentation about this topic in Mobiloitte's enterprise knowledge base.
2. State clearly that as Mobiloitte's Enterprise AI Assistant, your focus and expertise are dedicated to Mobiloitte's software engineering services, AI/ML capabilities, technology stack, company leadership, office locations, and corporate policies.
3. Do NOT provide general web trivia, chemical compound definitions, math table solutions, or out-of-domain general knowledge.
4. Keep the response polite, natural, executive, and helpful (2 to 3 sentences max).
5. Never repeat the raw user query verbatim or inside quotation marks.`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const promptTokens = data?.usageMetadata?.promptTokenCount || Math.ceil(systemPrompt.length / 4);
        const completionTokens = data?.usageMetadata?.candidatesTokenCount || Math.ceil((text || '').length / 4);

        if (text && typeof text === 'string') {
          return {
            rawText: text.trim(),
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
            latencyMs: Date.now() - startTime,
          };
        }
      }
    } catch (err: any) {
      console.warn('⚠️ Gemini Fallback API request notice:', err.message || err);
    }

    const fallbackMsg = this.formatNaturalFallbackMessage(query);
    return {
      rawText: fallbackMsg,
      promptTokens: Math.ceil(query.length / 4),
      completionTokens: Math.ceil(fallbackMsg.length / 4),
      totalTokens: Math.ceil((query.length + fallbackMsg.length) / 4),
      latencyMs: Date.now() - startTime,
    };
  }

  private formatNaturalFallbackMessage(query: string): string {
    const clean = query.trim().toLowerCase();
    if (/\b(policy|process|leave|holiday|vacation|laptop|vpn|reimbursement|attendance|travel|insurance|payroll|salary|asset)\b/i.test(clean)) {
      const rawTopic = query
        .replace(/^(what is|tell me about|what about|show|can i see|do we have|where is|is there a|do you have|a|an|the)\s+/i, '')
        .replace(/["']/g, '')
        .trim();
      const formattedTopic = rawTopic ? `Mobiloitte's ${rawTopic.replace(/^mobiloitte'?s?\s*/i, '')}` : 'this topic';
      return `I couldn't find relevant information regarding ${formattedTopic} in the current enterprise knowledge base. If this document exists internally, it may not have been uploaded yet. Please contact your department administrator for assistance.`;
    }

    return `I couldn't find relevant information about this topic in Mobiloitte's enterprise knowledge base. As Mobiloitte's Enterprise AI Assistant, I specialize in Mobiloitte's software engineering services, AI solutions, digital transformation, and corporate information. Feel free to ask me about Mobiloitte's capabilities or services!`;
  }

  private getMockEnterpriseOutput(input: GenerationInput, startTime: number): GeneratedLLMOutput {
    const stopwords = new Set([
      'what', 'when', 'where', 'which', 'does', 'have', 'that', 'this',
      'with', 'from', 'about', 'tell', 'know', 'give', 'want', 'many',
      'much', 'some', 'more', 'your', 'will', 'would', 'could', 'should',
    ]);
    const queryTerms = (input.query || '')
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 4 && !stopwords.has(t));

    const contentLines = input.formattedContext
      .split('\n')
      .map((l) => l.trim())
      .filter(
        (l) =>
          l.length > 20 &&
          !l.startsWith('[Source:') &&
          !l.startsWith('---') &&
          !l.startsWith('[Merged')
      );

    let bestLineIndex = 0;
    let bestScore = -1;

    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i];
      const lineLower = line.toLowerCase();
      const score = queryTerms.length > 0
        ? queryTerms.filter((t) => lineLower.includes(t)).length
        : 0;
      if (score > bestScore || (score === bestScore && line.length > contentLines[bestLineIndex].length)) {
        bestScore = score;
        bestLineIndex = i;
      }
    }

    let selectedLine = contentLines[bestLineIndex] || 'I don\'t have that specific information right now.';
    let mockText = selectedLine.trim();

    const isYesNo = /^(does|can|do|is|are|will|would|could)\b/i.test(input.query.trim());
    if (isYesNo && !mockText.toLowerCase().startsWith('yes')) {
      mockText = `Yes. ${mockText}`;
    }

    const isHeader = /^(\d+\.\d+|CHAPTER|Chapter|#)/i.test(selectedLine) || (!/[.!?]$/.test(selectedLine) && selectedLine.length < 70);
    if (isHeader && bestLineIndex < contentLines.length - 1) {
      const detailLines: string[] = [selectedLine];
      for (let j = bestLineIndex + 1; j < Math.min(contentLines.length, bestLineIndex + 4); j++) {
        const nextLine = contentLines[j];
        if (/^(\d+\.\d+|CHAPTER|Chapter|#)/i.test(nextLine)) break;
        detailLines.push(nextLine);
      }
      mockText = detailLines.join('\n\n');
    }
    const tokens = Math.ceil((input.formattedContext.length + mockText.length) / 4);

    return {
      rawText: mockText,
      promptTokens: Math.ceil(input.formattedContext.length / 4),
      completionTokens: Math.ceil(mockText.length / 4),
      totalTokens: tokens,
      latencyMs: Date.now() - startTime,
    };
  }
}

export const geminiResponseService = new GeminiResponseService();
