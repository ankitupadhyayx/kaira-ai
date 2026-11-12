import { BaseTemplate } from './base.template';
import { ResponseType, ChatResponse, ResponseDepth } from '../types/formatter.types';
import { BaseKnowledgeRecord } from '../../schemas/base/base-knowledge.schema';

export class ComparisonTemplate extends BaseTemplate {
  public readonly type: ResponseType = 'Comparison';

  public render(
    record: BaseKnowledgeRecord,
    query: string,
    matchType: string = 'COMPARISON',
    confidence: number = 1.0
  ): ChatResponse {
    const depth: ResponseDepth = 4;
    const title = 'Mobiloitte Enterprise Technology Comparison: AI vs Blockchain';
    const summary = 'Comparative feature matrix and strategic architecture trade-offs between Artificial Intelligence (AI) and Blockchain/Web3 development.';

    const matrixTable = [
      '| Feature / Parameter | Artificial Intelligence (AI) | Blockchain & Web3 |',
      '|---|---|---|',
      '| **Primary Focus** | Data Intelligence, Machine Learning & Automation | Decentralized Trust, Smart Contracts & Ledger Integrity |',
      '| **Core Technologies** | Python, TensorFlow, PyTorch, LLMs, Computer Vision | Solidity, Rust, Ethereum, Polygon, Hyperledger |',
      '| **Data Processing** | Asynchronous / Parallel Neural Model Inference | Distributed Consensus & Immutable Block Ledger |',
      '| **Enterprise Use Cases** | Predictive Analytics, Chatbots, Image Recognition | DeFi Protocols, Tokenomics, Supply Chain Auditing |',
      '| **Mobiloitte Expertise** | 200+ AI Engineers & Custom LLM Fine-Tuning | 150+ Blockchain Architects & Smart Contract Audits |',
    ].join('\n');

    const highlights = [
      'AI optimizes data automation and decision intelligence',
      'Blockchain secures digital ownership and immutable transaction ledgers',
      'Mobiloitte delivers hybrid AI + Web3 solution integration for enterprise platforms',
    ];

    const followUpQuestions = [
      'Would you like to review Mobiloitte AI & ML development services?',
      'Would you like to explore Blockchain & Smart Contract engineering?',
      'How to contact Mobiloitte engineering specialists?',
    ];

    const markdownBlocks = [
      `# ${title}`,
      `_${summary}_`,
      `### Comparison Matrix\n\n${matrixTable}`,
      `### Key Points\n` + highlights.map((h) => `• ${h}`).join('\n'),
      `### Suggested Questions\n` + followUpQuestions.map((q) => `• ${q}`).join('\n'),
    ];

    return {
      type: this.type,
      depth,
      title,
      summary,
      body: summary,
      highlights,
      followUpQuestions,
      sections: [
        {
          heading: 'Comparison Matrix',
          content: matrixTable,
        },
      ],
      relatedTopics: ['AI', 'Blockchain', 'Web3', 'Machine Learning', 'Smart Contracts'],
      references: [
        '[Mobiloitte AI Services](https://www.mobiloitte.com/services/artificial-intelligence/)',
        '[Mobiloitte Blockchain Services](https://www.mobiloitte.com/services/blockchain-development/)',
      ],
      metadata: {
        domain: 'comparison',
        confidence,
        matchType,
      },
      markdownText: markdownBlocks.join('\n\n'),
    };
  }
}
