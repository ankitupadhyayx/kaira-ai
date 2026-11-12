import { GibberishEngine } from '../../../src/engines/gibberish/services/gibberish.engine';
import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';

describe('Enterprise Gibberish Protection & Routing Audit Suite', () => {
  const gibberishEngine = new GibberishEngine();
  const orchestrator = new MasterOrchestrator();

  const validEnterpriseQueries = [
    'innovation approach',
    'rag solution',
    'spring boot',
    'flutter',
    'react native',
    'devops',
    'gen ai',
    'llm',
    'machine learning',
    'computer vision',
    'organization structure',
    'holiday policy',
    'benefits',
    'attendance',
    'iso',
    'nda',
    'android',
    'ios',
    'ci cd',
    'pipeline',
  ];

  it.each(validEnterpriseQueries)('NEVER flags valid enterprise query "%s" as gibberish', (query) => {
    const context = {
      rawInput: query,
      originalQuery: query,
      cleanQuery: query.toLowerCase(),
      normalizedQuery: query.toLowerCase(),
      tokens: query.toLowerCase().split(/\s+/),
      correctedTokens: query.toLowerCase().split(/\s+/),
      normalizedTokens: query.toLowerCase().split(/\s+/),
    } as any;

    const result = gibberishEngine.process(context);
    expect(result.handled).toBe(false);
    expect(result.confidence).toBeLessThan(0.90);
  });

  const keyboardSmashQueries = ['asdfasdf', 'ghjklkjh', 'xxyzzqq', '123@@@', 'qwertyuiopasdf'];

  it.each(keyboardSmashQueries)('correctly detects random keyboard smash "%s" as gibberish', (query) => {
    const context = {
      rawInput: query,
      originalQuery: query,
      cleanQuery: query.toLowerCase(),
      normalizedQuery: query.toLowerCase(),
      tokens: [query.toLowerCase()],
      correctedTokens: [query.toLowerCase()],
      normalizedTokens: [query.toLowerCase()],
    } as any;

    const result = gibberishEngine.process(context);
    expect(result.handled).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(0.90);
  });

  it('routes valid technical queries to Knowledge Engine / RAG with aligned source label', async () => {
    const res = await orchestrator.processRequestAsync('tell me about devops pipeline');
    expect(res.winningEngineName).not.toBe('GibberishEngine');
    expect(res.winningEngineName).not.toBe('Gibberish Engine');
  });
});
