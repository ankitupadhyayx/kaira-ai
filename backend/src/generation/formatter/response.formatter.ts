import {
  GenerationInput,
  GeneratedLLMOutput,
  FormattedEnterpriseResponse,
} from '../types/generation.types';
import { CitationReference } from '../../retrieval/types/retrieval.types';

export class ResponseFormatter {
  /**
   * Formats raw FastPath, RAG, or Fallback outputs into structured, citation-ready Enterprise Responses.
   */
  public formatEnterpriseResponse(
    route: 'fastpath' | 'rag' | 'fallback',
    rawResponseText: string,
    input?: GenerationInput,
    llmOutput?: GeneratedLLMOutput,
    fastPathConfidence?: number,
    totalProcessingTimeMs: number = 0
  ): FormattedEnterpriseResponse {
    if (route === 'fastpath') {
      return {
        route: 'fastpath',
        response: rawResponseText,
        confidence: fastPathConfidence || 0.95,
        sources: [],
        citations: [],
        related_questions: ['How can I help you further?'],
        follow_up: ['Would you like to ask another enterprise question?'],
        processing_time: totalProcessingTimeMs,
        statistics: { route: 'fastpath', confidence: fastPathConfidence || 0.95 },
      };
    }

    if (route === 'fallback' || !input || !input.candidateChunks || input.candidateChunks.length === 0) {
      return {
        route: 'fallback',
        response: rawResponseText,
        confidence: 0.0,
        sources: [],
        citations: [],
        related_questions: [
          'Can you rephrase your question?',
          'Who is the HR or IT Administrator contact?',
        ],
        follow_up: [
          'Try specifying department or document title in your question.',
        ],
        processing_time: totalProcessingTimeMs,
        statistics: { route: 'fallback', candidatesFound: 0 },
      };
    }

    // RAG Mode Processing
    const citations: CitationReference[] = input.citations || [];
    const sources: CitationReference[] = citations;

    // Step 7: Compute Confidence Score
    const maxScore = input.maxScore || 0;
    const avgScore = input.avgScore || 0;
    const topKUsed = input.topKUsed || 1;
    const completenessRatio = Math.min(1.0, input.candidateChunks.length / topKUsed);
    const confidence = parseFloat((0.4 * maxScore + 0.3 * avgScore + 0.3 * completenessRatio).toFixed(2));

    // Step 8 & 9: Generate Related Questions & Follow-ups from Document Headings
    const related_questions = this.extractRelatedQuestions(input);
    const follow_up = this.extractFollowUps(input);

    return {
      route: 'rag',
      response: rawResponseText,
      confidence: Math.min(1.0, confidence),
      sources,
      citations,
      related_questions,
      follow_up,
      processing_time: totalProcessingTimeMs,
      statistics: {
        route: 'rag',
        maxScore,
        avgScore,
        totalTokens: llmOutput?.totalTokens || input.totalTokens || 0,
        promptTokens: llmOutput?.promptTokens || 0,
        completionTokens: llmOutput?.completionTokens || 0,
        candidatesFound: input.candidateChunks.length,
        topKUsed,
        generationLatencyMs: llmOutput?.latencyMs || 0,
      },
    };
  }

  private extractRelatedQuestions(input: GenerationInput): string[] {
    const questions: string[] = [];
    const headings = new Set<string>();

    for (const chunk of input.candidateChunks) {
      if (chunk.heading && chunk.heading !== 'General Heading' && !headings.has(chunk.heading)) {
        headings.add(chunk.heading);
        questions.push(`What are the details regarding ${chunk.heading}?`);
      }
      if (questions.length >= 3) break;
    }

    if (questions.length === 0) {
      questions.push('Would you like further details on this policy?');
      questions.push('Who is listed as the document author?');
    }

    return questions.slice(0, 3);
  }

  private extractFollowUps(input: GenerationInput): string[] {
    const followUps: string[] = [];
    const sections = new Set<string>();

    for (const chunk of input.candidateChunks) {
      if (chunk.section && chunk.section !== 'General Section' && !sections.has(chunk.section)) {
        sections.add(chunk.section);
        followUps.push(`Would you like to explore section: ${chunk.section}?`);
      }
      if (followUps.length >= 2) break;
    }

    if (followUps.length === 0) {
      followUps.push('Should I fetch related department guidelines?');
    }

    return followUps.slice(0, 2);
  }
}

export const responseFormatter = new ResponseFormatter();
