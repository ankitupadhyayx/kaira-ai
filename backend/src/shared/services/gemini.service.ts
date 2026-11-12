import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export class GeminiService {
  private readonly apiKey = process.env.GEMINI_API_KEY || '';
  private readonly modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  /**
   * Gemini Enterprise Mode — Generates answer strictly grounded in the provided document context.
   */
  public async generateEnterpriseResponse(
    query: string,
    formattedContext: string
  ): Promise<string> {
    if (process.env.NODE_ENV === 'test' || !this.apiKey) {
      return this.getMockEnterpriseResponse(query, formattedContext);
    }

    try {
      const systemPrompt = `You are Kaira, Senior Enterprise AI Consultant for Mobiloitte. Written as if an experienced employee is answering another employee.

USER QUESTION: ${query}

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
${formattedContext}

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
        if (text && typeof text === 'string') {
          return text.trim();
        }
      }
    } catch (err: any) {
      console.warn('⚠️ Gemini API request notice:', err.message || err);
    }

    return this.getMockEnterpriseResponse(query, formattedContext);
  }

  /**
   * Gemini Fallback Mode — Triggers when no relevant document context passes the similarity threshold.
   */
  public async generateFallbackResponse(query: string): Promise<string> {
    if (process.env.NODE_ENV === 'test' || !this.apiKey) {
      return this.formatNaturalFallbackMessage(query);
    }

    try {
      const systemPrompt = `You are Kaira, Mobiloitte's intelligent AI assistant. No relevant enterprise document context was retrieved for this query.

USER QUESTION: ${query}

=== STRICT FALLBACK FORMATTING RULES ===
1. NEVER repeat the user's raw query verbatim or inside quotation marks (e.g., NEVER say "I couldn't find information about \\"laptop\\"." or "No documents matched \\"holidayyy\\".").
2. If the query refers to a specific company policy, process, technology, or document, mention the concept in natural language (e.g., "Mobiloitte's laptop policy") without quotation marks.
3. If the query is generic or unclear, use neutral wording such as: "I couldn't find relevant information about this topic in the current enterprise knowledge base."
4. Avoid quotation marks around user queries. Responses must sound like an experienced human assistant, not a search engine.

CLASSIFY AND RESPOND ACCORDING TO THESE THREE FALLBACK CATEGORIES:

CATEGORY A — Enterprise Internal Question (e.g., laptop policy, VPN policy, expense reimbursement, leave encashment, attendance, travel policy):
- State clearly in natural language: "I couldn't find any information about Mobiloitte's [Topic] in the current enterprise knowledge base. If this policy exists internally, it may not have been uploaded yet. Please contact the relevant department or ask an administrator to upload the document."

CATEGORY B — General Knowledge Topic (e.g., football, pizza, cricket, general technical concepts):
- Respond briefly (2–3 sentences) with helpful general knowledge first, then clarify: "This information is based on general knowledge because no related enterprise document was found."

CATEGORY C — Out-of-Domain Consumer Request (e.g., order pizza, book flight, movie recommendation, dating advice):
- Politely explain that you focus on enterprise knowledge and company information.

Keep your response friendly, professional, and natural.`;

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
        if (text && typeof text === 'string') {
          return text.trim();
        }
      }
    } catch (err: any) {
      console.warn('⚠️ Gemini API request notice:', err.message || err);
    }

    return this.formatNaturalFallbackMessage(query);
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

    return `I couldn't find relevant information about this topic in the current enterprise knowledge base. If this document or policy exists internally, it may not have been uploaded yet. Please contact your department administrator for assistance.`;
  }

  private getMockEnterpriseResponse(query: string, formattedContext: string): string {
    const isYesNo = /^(does|can|do|is|are|will|would|could)\b/i.test(query.trim());
    const lines = formattedContext
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 25 && !l.startsWith('[Source') && !l.startsWith('---'));

    let mockAnswer = lines[0] || 'Mobiloitte provides enterprise software development services.';
    if (isYesNo && !mockAnswer.toLowerCase().startsWith('yes')) {
      mockAnswer = `Yes. ${mockAnswer}`;
    }

    return mockAnswer;
  }
}

export const geminiService = new GeminiService();
