import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';

describe('Technology-Specific Service Fast Paths Execution Suite', () => {
  let orchestrator: MasterOrchestrator;

  beforeEach(() => {
    orchestrator = new MasterOrchestrator();
  });

  // 1. AI & Generative AI
  describe('AI & Generative AI Queries', () => {
    const AI_QUERIES = [
      'AI',
      'artificial intelligence',
      'artifical intelligence',
      'gen ai',
      'generative ai',
      'genai',
      'genrative ai',
      'machine learning',
      'machin learning',
      'ml',
      'deep learning',
      'deep learnng',
      'dl',
      'llm',
      'large language model',
      'nlp',
      'natural language processing',
      'computer vision',
      'cv',
      'predictive analytics',
      'recommendation engine',
      'chatbot',
      'rag',
      'ai agent',
      'autonomous agent',
      'agentic ai',
      'AI banate ho',
      'GenAI services',
      'Machine learning karte ho',
    ];

    AI_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to AI & Generative AI response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(AI|Artificial Intelligence|Machine Learning|Mobiloitte|services|solutions|technology|stack)/i);
        expect(msg.length).toBeGreaterThan(10);
        expect(msg).not.toContain('Who is the CEO of Mobiloitte?');
        expect(msg).not.toContain('Mobiloitte Company Profile');
      });
    });
  });

  // 2. Mobile App Development
  describe('Mobile App Development Queries', () => {
    const MOBILE_QUERIES = [
      'mobile app',
      'mobile apps',
      'mobile application',
      'android',
      'andrid',
      'ios',
      'ioss',
      'flutter',
      'fluter',
      'react native',
      'kotlin',
      'swift',
      'cross platform',
      'mobile development',
      'mobile solutions',
      'Flutter app banate ho',
      'App bana sakte ho',
    ];

    MOBILE_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Mobile App Development response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Mobile|iOS|Android|Flutter|React Native|Mobiloitte|services|app)/i);
        expect(msg.length).toBeGreaterThan(10);
        expect(msg).not.toContain('Who is the CEO of Mobiloitte?');
        expect(msg).not.toContain('Mobiloitte Company Profile');
      });
    });
  });

  // 3. Web Application Development
  describe('Web Application Development Queries', () => {
    const WEB_QUERIES = [
      'web app',
      'web application',
      'website',
      'react',
      'reactjs',
      'nextjs',
      'next js',
      'angular',
      'vue',
      'node',
      'express',
      'frontend',
      'backend',
      'full stack',
      'fullstack',
      'React me development karte ho',
      'Website bana sakte ho',
    ];

    WEB_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Web Application Development response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Web|React|Next|Angular|Vue|Node|Full Stack|Mobiloitte|website)/i);
        expect(msg.length).toBeGreaterThan(10);
        expect(msg).not.toContain('Who is the CEO of Mobiloitte?');
      });
    });
  });

  // 4. Blockchain & Web3
  describe('Blockchain & Web3 Queries', () => {
    const BLOCKCHAIN_QUERIES = [
      'blockchain',
      'blokchain',
      'web3',
      'ethereum',
      'etherum',
      'polygon',
      'solidity',
      'hyperledger',
      'smart contract',
      'crypto',
      'tokenization',
      'Blockchain ka project karte ho',
      'Web3 kaam karte ho',
    ];

    BLOCKCHAIN_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Blockchain & Web3 response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Blockchain|Web3|Ethereum|Smart Contract|Hyperledger|Polygon|Mobiloitte)/i);
        expect(msg.length).toBeGreaterThan(10);
        expect(msg).not.toContain('Who is the CEO of Mobiloitte?');
      });
    });
  });

  // 5. Cloud & DevOps
  describe('Cloud & DevOps Queries', () => {
    const CLOUD_QUERIES = [
      'cloud',
      'aws',
      'azure',
      'gcp',
      'google cloud',
      'docker',
      'dockr',
      'kubernetes',
      'kubernets',
      'devops',
      'devopss',
      'ci cd',
      'cicd',
      'terraform',
      'terrform',
      'Cloud services dete ho',
      'AWS use karte ho',
    ];

    CLOUD_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Cloud & DevOps response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Cloud|AWS|Azure|GCP|DevOps|Docker|Kubernetes|Mobiloitte)/i);
        expect(msg.length).toBeGreaterThan(10);
      });
    });
  });

  // 6. IoT Solutions
  describe('IoT Solutions Queries', () => {
    const IOT_QUERIES = [
      'iot',
      'iott',
      'internet of things',
      'embedded',
      'smart devices',
      'iiot',
    ];

    IOT_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to IoT Solutions response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(IoT|Internet of Things|Embedded|Smart Device|Mobiloitte)/i);
        expect(msg.length).toBeGreaterThan(10);
      });
    });
  });

  // 7. Enterprise Software
  describe('Enterprise Software Queries', () => {
    const ENTERPRISE_QUERIES = [
      'erp',
      'crm',
      'enterprise software',
      'enterprize software',
      'saas',
      'business software',
      'enterprise applications',
    ];

    ENTERPRISE_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Enterprise Software response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Enterprise|ERP|CRM|SaaS|Software|Mobiloitte)/i);
        expect(msg.length).toBeGreaterThan(10);
      });
    });
  });

  // 8. UI/UX Design
  describe('UI/UX Design Queries', () => {
    const UIUX_QUERIES = [
      'ui',
      'ux',
      'ui ux',
      'figma',
      'wireframe',
      'wirefram',
      'prototype',
      'user interface',
      'user experience',
    ];

    UIUX_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to UI/UX Design response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(UI|UX|Design|Figma|Wireframe|Interface|Mobiloitte)/i);
        expect(msg.length).toBeGreaterThan(10);
      });
    });
  });

  // 9. QA & Testing
  describe('QA & Testing Queries', () => {
    const QA_QUERIES = [
      'qa',
      'testing',
      'manual testing',
      'automation testing',
      'selenium',
      'selenim',
      'quality assurance',
      'QA testing karte ho',
    ];

    QA_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to QA & Testing response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(QA|Testing|Automation|Selenium|Quality Assurance|Mobiloitte)/i);
        expect(msg.length).toBeGreaterThan(10);
      });
    });
  });

  // 10. Dedicated Development Teams
  describe('Dedicated Development Teams Queries', () => {
    const TEAM_QUERIES = [
      'dedicated developers',
      'hire developers',
      'development team',
      'offshore team',
      'remote developers',
      'team augmentation',
      'Dedicated developers milenge',
    ];

    TEAM_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Dedicated Development Teams response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Dedicated|Developers|Team|Augmentation|Offshore|Mobiloitte|consultants|sales)/i);
        expect(msg.length).toBeGreaterThan(10);
      });
    });
  });

  // Negative Assertions
  describe('Negative Assertions (No Misrouting)', () => {
    it('should NOT route tech queries to CEO, Leadership, or Company Profile', () => {
      const inputs = ['AI', 'Flutter', 'React', 'Blockchain', 'AWS', 'Docker', 'QA', 'Figma', 'ERP', 'Dedicated developers'];
      inputs.forEach((input) => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).not.toContain('Jagdish Harsh is the Founder & Group CEO');
        expect(msg).not.toContain('Mobiloitte Company Profile');
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });
});
