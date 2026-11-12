import { PromptSuggestion, Conversation } from '../types/chat';

export const PROMPT_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: 'sug-1',
    label: 'Company Overview',
    prompt: 'Can you tell me about Mobiloitte Technologies and its background?',
    category: 'Company',
  },
  {
    id: 'sug-2',
    label: 'Our Core Services',
    prompt: 'What services does Mobiloitte provide for enterprise clients?',
    category: 'Services',
  },
  {
    id: 'sug-3',
    label: 'AI & ML Expertise',
    prompt: 'What AI and Machine Learning capabilities does Mobiloitte offer?',
    category: 'Technologies',
  },
  {
    id: 'sug-4',
    label: 'Career Opportunities',
    prompt: 'What job openings and career paths are currently available at Mobiloitte?',
    category: 'Careers',
  },
  {
    id: 'sug-5',
    label: 'Global Offices & Contact',
    prompt: 'Where are Mobiloitte offices located and how can I get in touch with sales?',
    category: 'Contact',
  },
];

export const MOCK_KNOWLEDGE_BASE: Record<string, string> = {
  overview: `### Welcome to Mobiloitte Technologies

**Mobiloitte** is a premier Premier Premier Enterprise AI, Blockchain, and Full-Stack Digital Transformation agency established in **2004**. 

Over the past 20+ years, Mobiloitte has successfully delivered over **5,000+ digital applications** for global enterprises, startups, and Fortune 500 companies across North America, Europe, Asia-Pacific, and the Middle East.

#### Core Pillars:
- **Artificial Intelligence & Generative AI Solutions**
- **Blockchain & Web3 Engineering**
- **Mobile & Enterprise Web Application Development**
- **Cloud Native Infrastructure & DevOps**
- **IoT & Embedded Software**

*ISO 9001:2015 & CMMI Level 3 Certified Organization.*`,

  services: `### Mobiloitte Service Portfolio

We provide end-to-end software engineering and digital transformation services:

| Service Vertical | Key Capabilities & Highlights |
| :--- | :--- |
| **Artificial Intelligence** | LLM Integration, Custom Agentic Workflows, RAG Pipelines, Computer Vision, Predictive Analytics |
| **Mobile Engineering** | Native iOS (Swift), Native Android (Kotlin), Flutter, React Native, Cross-platform enterprise apps |
| **Enterprise Web** | Next.js, React, Node.js, Microservices Architecture, Cloud API Integrations |
| **Blockchain & Web3** | Smart Contracts (Solidity/Rust), DeFi Platforms, NFT Marketplaces, Private Ledger Systems |
| **Cloud & DevOps** | AWS, Azure, GCP, Kubernetes, CI/CD Automation, Infrastructure as Code (Terraform) |

Would you like to schedule a consultation with our technology architects?`,

  ai: `### AI & Generative Machine Learning Engineering

Mobiloitte helps businesses harness modern AI technologies to automate complex operations and elevate customer experience:

1. **Custom LLM Fine-Tuning & RAG**: Context-aware AI assistants trained on proprietary enterprise knowledge bases.
2. **Computer Vision & OCR**: Intelligent document extraction, automated video analytics, and facial recognition.
3. **Predictive Analytics Engine**: Machine learning models for forecasting, fraud detection, and customer lifetime value optimization.
4. **Agentic Workflows**: Autonomous multi-agent systems designed to automate multi-step enterprise workflows.

#### Technology Stack:
\`\`\`python
# Example Agentic Pipeline Configuration
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent

llm = ChatOpenAI(model="gpt-4o", temperature=0.2)
# Mobiloitte Enterprise RAG Orchestration Pipeline
\`\`\``,

  careers: `### Careers & Hiring at Mobiloitte Technologies

Mobiloitte is continuously seeking passionate innovators to join our global team of 500+ engineers!

#### Current Openings:
- **Senior AI / ML Engineer**: 4+ years in PyTorch, LangChain, RAG pipelines & vector databases.
- **Lead Next.js / Full-Stack Architect**: Expertise in Next.js 15, TypeScript, Node.js, and microservice architectures.
- **Blockchain Developer**: Hands-on experience with Solidity, Smart Contract audits, and Web3 integration.
- **Cloud DevOps Specialist**: Proficiency in AWS/GCP, Kubernetes, Docker, and Terraform.

#### Employee Benefits:
- Flexible hybrid working arrangements
- Continuous learning certification sponsorships
- Global project exposure & competitive remuneration

Interested candidates can submit their resume to **careers@mobiloitte.com**.`,

  contact: `### Global Offices & Business Inquiries

Mobiloitte operates worldwide with dedicated development centers and regional business offices:

- 🇮🇳 **India Headquarters**: D-115, Okhla Industrial Area Phase I, New Delhi - 110020
- 🇺🇸 **United States**: Boston, MA & New York, NY
- 🇬🇧 **United Kingdom**: London Office
- 🇸🇬 **Singapore**: APAC Regional Hub

#### Contact Info:
- **General Inquiries**: info@mobiloitte.com
- **Sales & Consultations**: sales@mobiloitte.com
- **HR & Careers**: careers@mobiloitte.com
- **Website**: [https://www.mobiloitte.com](https://www.mobiloitte.com)`
};

export const INITIAL_MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Mobiloitte Overview & Services',
    lastUpdated: 'Just now',
    messages: [
      {
        id: 'msg-1',
        role: 'assistant',
        content: `Hello! I'm **Kaira**, your Mobiloitte enterprise assistant. 👋\n\nI can help you with:\n- 🏢 Company background & services\n- 🤖 AI, Blockchain & technology expertise\n- 💼 Careers & hiring at Mobiloitte\n- 🌍 Global office locations & contact info\n\nWhat would you like to know?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'complete',
      },
    ],
  },
];
