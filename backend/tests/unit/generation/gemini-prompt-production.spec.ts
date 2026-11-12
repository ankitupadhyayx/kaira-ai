import { geminiResponseService } from '../../../src/generation/services/gemini-response.service';
import { geminiService } from '../../../src/shared/services/gemini.service';

describe('Enterprise Gemini Answer Generation Prompt Suite', () => {
  it('frames yes/no capability queries starting with "Yes."', async () => {
    const output = await geminiResponseService.generateEnterpriseResponse({
      query: 'Does Mobiloitte provide mobile app development?',
      normalizedQuery: 'mobile app development',
      formattedContext: '[Source: Doc 1]\nMobiloitte provides end-to-end mobile application development services for iOS and Android.',
      candidateChunks: [],
      citations: [],
      topKUsed: 5,
      maxScore: 0.88,
      avgScore: 0.85,
      totalTokens: 150,
      filtersApplied: {},
    });

    expect(output.rawText).toMatch(/^Yes\./i);
    expect(output.rawText).toContain('mobile');
  });

  it('provides direct consultant answer for shared gemini service', async () => {
    const text = await geminiService.generateEnterpriseResponse(
      'Can Mobiloitte build Flutter apps?',
      '[Source: Doc 1]\nMobiloitte builds cross-platform mobile apps using Flutter and React Native.'
    );

    expect(text).toMatch(/^Yes\./i);
    expect(text).toContain('Flutter');
  });

  it('handles fallback queries with polite missing information message', async () => {
    const output = await geminiResponseService.generateFallbackResponse('Mobiloitte laptop policy');
    expect(output.rawText).toContain('knowledge base');
  });
});
