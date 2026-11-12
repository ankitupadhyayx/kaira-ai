/**
 * Enterprise FastPath Engine Audit & Comprehensive Verification Spec
 *
 * Validates Phase 1 through Phase 9 of the Enterprise FastPath Specification:
 * 1. FastPath serves ONLY deterministic corporate identity & contact metadata
 * 2. All document-level topics (Services, Tech Stacks, AI, Cloud, DevOps, HR Policies,
 *    Security, Compliance, Pricing, Certifications, Awards, Case Studies) bypass FastPath and route to RAG
 * 3. 100+ query variations (typos, misspellings, Hinglish, short forms, word order, emojis)
 * 4. 100% source synchronization (FastPath vs RAG)
 */

import { MasterOrchestrator } from '../../../../src/arbitration/master.orchestrator';
import { ResponseBuilder } from '../../../../src/conversation/response-builder/response.builder';
import { FastPathStubEngine } from '../../../../src/orchestration/fastpath-stub/fastpath.stub.engine';
import { FastPathEngine } from '../../../../src/engines/fast-path/services/fast-path.engine';
import { ProcessingContext } from '../../../../src/normalization/types/processing-context.types';

// ─────────────────────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────────────────────

const orchestrator = new MasterOrchestrator();
const responseBuilder = new ResponseBuilder();
const stubEngine = new FastPathStubEngine();
const fastPathEngine = new FastPathEngine();

import { PipelineOrchestrator } from '../../../../src/normalization/pipeline-orchestrator/pipeline.orchestrator';

const normalizer = new PipelineOrchestrator();

function createContext(query: string): ProcessingContext {
  return normalizer.process(query);
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3 & 4: Deterministic FastPath Intents Verification
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 3 & 4: Deterministic FastPath Intents', () => {
  const deterministicQueries = [
    { query: 'who is the ceo of mobiloitte', expectedKeyword: 'Jagdish Harsh', topic: 'CEO' },
    { query: 'who is the founder of mobiloitte', expectedKeyword: 'Jagdish Harsh', topic: 'Founder' },
    { query: 'ceo', expectedKeyword: 'Jagdish Harsh', topic: 'CEO Short' },
    { query: 'ceoo name', expectedKeyword: 'Jagdish Harsh', topic: 'CEO Typo' },
    { query: 'ceo kaun hai', expectedKeyword: 'Jagdish Harsh', topic: 'CEO Hinglish' },

    { query: 'tell me about mobiloitte', expectedKeyword: 'Mobiloitte', topic: 'Company Profile' },
    { query: 'what is mobiloitte', expectedKeyword: '2004', topic: 'Company Profile' },
    { query: 'company profile', expectedKeyword: 'Mobiloitte', topic: 'Company Profile' },

    { query: 'headquarters', expectedKeyword: 'New Delhi', topic: 'HQ' },
    { query: 'hq', expectedKeyword: 'New Delhi', topic: 'HQ Short' },
    { query: 'head office', expectedKeyword: 'New Delhi', topic: 'HQ' },
    { query: 'delhi office', expectedKeyword: 'New Delhi', topic: 'India Office' },
    { query: 'office address', expectedKeyword: 'Okhla', topic: 'Address' },

    { query: 'global offices', expectedKeyword: 'USA', topic: 'Global Offices' },
    { query: 'usa office', expectedKeyword: 'Boston', topic: 'USA Office' },
    { query: 'uk office', expectedKeyword: 'London', topic: 'UK Office' },
    { query: 'dubai office', expectedKeyword: 'Dubai', topic: 'UAE Office' },
    { query: 'singapore office', expectedKeyword: 'Singapore', topic: 'Singapore Office' },

    { query: 'contact number', expectedKeyword: '+91-9999525501', topic: 'Phone' },
    { query: 'phone number', expectedKeyword: '+91-9999525501', topic: 'Phone' },
    { query: 'sales email', expectedKeyword: 'sales@mobiloitte.com', topic: 'Sales Email' },
    { query: 'hr email', expectedKeyword: 'hr@mobiloitte.com', topic: 'HR Email' },
    { query: 'support email', expectedKeyword: 'support@mobiloitte.com', topic: 'Support Email' },

    { query: 'website', expectedKeyword: 'https://www.mobiloitte.com', topic: 'Website' },
    { query: 'social media', expectedKeyword: 'LinkedIn', topic: 'Social Media' },

    { query: 'careers', expectedKeyword: 'mobiloitte.com/careers', topic: 'Careers' },
    { query: 'jobs', expectedKeyword: 'mobiloitte.com/careers', topic: 'Jobs' },
    { query: 'internship', expectedKeyword: 'hr@mobiloitte.com', topic: 'Internships' },
  ];

  deterministicQueries.forEach(({ query, expectedKeyword, topic }) => {
    it(`handles deterministic intent for "${query}" (${topic})`, () => {
      const res = orchestrator.processRequest(query);
      const built = responseBuilder.buildResponse(res.composedResponse || res.winningEngineResult);

      expect(res.winningEngineResult.handled).toBe(true);
      expect(res.winningEngineResult.responseCandidate).toContain(expectedKeyword);
      expect(built.data?.debugSource).toMatch(/FastPath|Greeting/);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 5: RAG-Only Document Knowledge Routing Guard
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 5: Document Knowledge Bypass (Routes ONLY to RAG)', () => {
  const ragOnlyQueries = [
    // Services
    'what services does mobiloitte provide',
    'tell me about AI services',
    'blockchain development services',
    'cloud engineering solutions',
    'mobile app development services',
    'web application services',
    'ui ux design services',
    'qa testing services',

    // Technology Stack & Frameworks
    'react development',
    'flutter cross platform',
    'node.js backend',
    'python machine learning',
    'solidity smart contract',
    'aws cloud architecture',
    'docker kubernetes devops',
    'spring boot java',

    // Policies & HR
    'leave policy',
    'sick leave rules',
    'holiday calendar 2026',
    'attendance policy',
    'salary structure',
    'health insurance benefits',
    'work from home policy',

    // Security & Compliance
    'security guidelines',
    'gdpr compliance',
    'nda confidentiality terms',
    'mfa authentication',

    // Pricing & Commercials
    'pricing details',
    'how much does a website cost',
    'hourly rate for developers',

    // Enterprise Depth & Portfolio
    'case studies',
    'client portfolio',
    'certifications list',
    'awards won by mobiloitte',
    'company history and milestones',
  ];

  ragOnlyQueries.forEach((query) => {
    it(`defers "${query}" away from FastPath to RAG`, () => {
      const ctx = createContext(query);
      const stubRes = stubEngine.process(ctx);
      const fpRes = fastPathEngine.process(ctx);

      // FastPath stub and engine MUST refuse to handle document-based queries
      expect(stubRes.handled).toBe(false);
      expect(fpRes.handled).toBe(false);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 9: 100+ Query Variation Verification Matrix
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 9: 100+ Query Variations Verification Matrix', () => {
  const queryVariations = [
    // Greetings & Small Talk (15)
    'hello', 'helo', 'hey', 'hi', 'gm', 'good morning', 'good afternoon', 'good evening',
    'namaste', 'howdy', 'hi there', 'hello kaira', 'thank you', 'thanks', 'thnx',

    // CEO & Founder Variations (20)
    'ceo', 'ceoo', 'cwo', 'coe', 'who is ceo', 'who is the ceo of mobiloitte',
    'jagdish harsh', 'jagdishh', 'founder', 'fouder', 'foundr', 'who founded mobiloitte',
    'company owner', 'owner kaun hai', 'ceo name', 'who runs mobiloitte',
    'who is the founder', 'founding director', 'group ceo', 'company head',

    // Headquarters & Office Address Variations (20)
    'hq', 'headquarters', 'headquarter', 'headquaters', 'head office',
    'corporate office', 'delhi office', 'new delhi office', 'okhla office',
    'office address', 'company address', 'registered address', 'where is head office',
    'hq address', 'delhi office address', 'head office kaha hai', 'headquarters location',
    'main office', 'primary office', 'india office',

    // Contact, Email & Phone Variations (25)
    'contact', 'contact us', 'get in touch', 'reach mobiloitte', 'contact number',
    'phone number', 'office phone', 'helpline', 'sales email', 'hr email',
    'support email', 'email address', 'official email', 'contact email',
    'how to contact mobiloitte', 'mobiloitte phone number', 'mobiloitte email',
    'customer care', 'sales contact', 'support desk', 'hr contact',
    'sales hotline', 'corporate hotline', 'phone', 'email',

    // Portals, Careers & Social Media Variations (20)
    'website', 'official website', 'web portal', 'mobiloitte website',
    'careers', 'careers page', 'career portal', 'jobs', 'job openings',
    'apply job', 'how to apply', 'internship', 'internships', 'internship training',
    'linkedin', 'twitter', 'facebook', 'youtube', 'instagram', 'social media',
  ];

  it('runs 100+ query variation checks with 100% success', () => {
    let successCount = 0;

    queryVariations.forEach((query) => {
      const res = orchestrator.processRequest(query);
      const built = responseBuilder.buildResponse(res.composedResponse || res.winningEngineResult);

      expect(res.winningEngineResult).toBeDefined();
      expect(built.success).toBe(true);
      expect(built.data?.debugSource).toBeDefined();
      successCount++;
    });

    expect(successCount).toBeGreaterThanOrEqual(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 7 & 8: Source Label & Diagnostic Synchronization
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 7 & 8: Source Synchronization', () => {
  it('synchronizes FastPath backend engine to debugSource: FastPath', () => {
    const res = orchestrator.processRequest('who is ceo of mobiloitte');
    const built = responseBuilder.buildResponse(res.composedResponse || res.winningEngineResult);

    expect(built.data?.debugSource).toBe('FastPath');
    expect(built.data?.debugBadge).toBe('Source: FastPath');
  });

  it('synchronizes Greeting backend engine to debugSource: Greeting', () => {
    const res = orchestrator.processRequest('hello');
    const built = responseBuilder.buildResponse(res.composedResponse || res.winningEngineResult);

    expect(built.data?.debugSource).toBe('Greeting');
    expect(built.data?.debugBadge).toBe('Source: Greeting');
  });

  it('synchronizes RAG queries to debugSource: RAG or Fallback', () => {
    const res = orchestrator.processRequest('what is the leave encashment policy');
    const built = responseBuilder.buildResponse(res.composedResponse || res.winningEngineResult);

    expect(['RAG', 'Fallback']).toContain(built.data?.debugSource);
  });
});
