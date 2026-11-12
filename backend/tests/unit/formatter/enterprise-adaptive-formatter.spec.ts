import { ResponseFormatter } from '../../../src/knowledge/formatter/response.formatter';
import { TemplateRegistry } from '../../../src/knowledge/formatter/templates/template.registry';
import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';

describe('Enterprise Adaptive Response Formatter (Stage 7.14)', () => {
  let formatter: ResponseFormatter;
  let orchestrator: MasterOrchestrator;

  beforeAll(() => {
    formatter = new ResponseFormatter();
    orchestrator = new MasterOrchestrator();
  });

  it('TemplateRegistry should resolve templates via Template Registry Pattern', () => {
    const registry = TemplateRegistry.getInstance();
    expect(registry.resolveTemplate(undefined, 'hello').type).toBe('Greeting');
    expect(registry.resolveTemplate(undefined, 'compare AI vs Blockchain').type).toBe('Comparison');
  });

  const testQueries = [
    { query: 'hello', expectedType: 'Greeting', expectedMinDepth: 1 },
    { query: 'bye', expectedType: 'Farewell', expectedMinDepth: 1 },
    { query: 'services', expectedType: 'Service Information', expectedMinDepth: 1 },
    { query: 'AI services', expectedType: 'Service Information', expectedMinDepth: 2 },
    { query: 'Cloud', expectedType: 'Service Information', expectedMinDepth: 1 },
    { query: 'CEO', expectedType: 'Company Information', expectedMinDepth: 1 },
    { query: 'History', expectedType: 'Company Information', expectedMinDepth: 1 },
    { query: 'Awards', expectedType: 'Company Information', expectedMinDepth: 1 },
    { query: 'Clients', expectedType: 'Company Information', expectedMinDepth: 1 },
    { query: 'Office', expectedType: 'List', expectedMinDepth: 1 },
    { query: 'Privacy Policy', expectedType: 'Policy', expectedMinDepth: 2 },
    { query: 'Internship', expectedType: 'List', expectedMinDepth: 1 },
    { query: 'Contact', expectedType: 'List', expectedMinDepth: 1 },
    { query: 'Support', expectedType: 'List', expectedMinDepth: 1 },
    { query: 'Compare AI vs Blockchain', expectedType: 'Comparison', expectedMinDepth: 4 },
    { query: 'Explain AI services in detail', expectedType: 'Service Information', expectedMinDepth: 4 },
  ];

  for (const tc of testQueries) {
    it(`should format query "${tc.query}" consistently using Enterprise Adaptive Formatter`, () => {
      const result = orchestrator.processRequest(tc.query);
      expect(result.winningEngineResult.handled).toBe(true);
      const candidate = result.winningEngineResult.responseCandidate || '';
      
      // Formatting Validation Rules
      expect(candidate).toBeDefined();
      expect(candidate.length).toBeGreaterThan(10);
      expect(candidate).toMatch(/^([#A-Za-z0-9])/); // Starts with valid header or text
      expect(candidate).not.toMatch(/\[object Object\]/); // No raw JSON object dumps
      expect(candidate).not.toMatch(/(?<!\]\()https?:\/\/[^\s\)]+/); // No raw exposed URLs without markdown formatting
    });
  }
});
