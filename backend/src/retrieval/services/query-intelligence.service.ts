import { QueryIntelligenceResult, QueryEntity, QueryIntelligenceOptions } from '../types/query-intelligence.types';

export class QueryIntelligenceService {
  private static readonly SPELLING_TYPOS: Record<string, string> = {
    mobiloite: 'Mobiloitte',
    mobilote: 'Mobiloitte',
    mobiolitte: 'Mobiloitte',
    mobiloitee: 'Mobiloitte',
    mobiloitt: 'Mobiloitte',
    policys: 'policies',
    ceoo: 'CEO',
    fouder: 'Founder',
    chhutti: 'leave',
    tankhwah: 'salary',
    inshurans: 'insurance',
    hoiday: 'holiday',
    vacationn: 'vacation',
    servuces: 'services',
    technolgy: 'technology',
    blockchan: 'blockchain',
    blokchain: 'blockchain',
    genrative: 'generative',
    machin: 'machine',
    kubernets: 'kubernetes',
    dockr: 'docker',
  };

  private static readonly ABBREVIATIONS: Record<string, { expanded: string; entityType: QueryEntity['type'] }> = {
    ai: { expanded: 'Artificial Intelligence', entityType: 'AI' },
    genai: { expanded: 'Generative AI', entityType: 'AI' },
    ml: { expanded: 'Machine Learning', entityType: 'AI' },
    dl: { expanded: 'Deep Learning', entityType: 'AI' },
    llm: { expanded: 'Large Language Model', entityType: 'AI' },
    nlp: { expanded: 'Natural Language Processing', entityType: 'AI' },
    cv: { expanded: 'Computer Vision', entityType: 'AI' },
    devops: { expanded: 'Development Operations', entityType: 'Cloud' },
    aws: { expanded: 'Amazon Web Services', entityType: 'Cloud' },
    gcp: { expanded: 'Google Cloud Platform', entityType: 'Cloud' },
    k8s: { expanded: 'Kubernetes', entityType: 'Cloud' },
    qa: { expanded: 'Quality Assurance', entityType: 'Technology' },
    qc: { expanded: 'Quality Control', entityType: 'Technology' },
    'ui/ux': { expanded: 'User Interface and User Experience Design', entityType: 'Technology' },
    uiux: { expanded: 'User Interface and User Experience Design', entityType: 'Technology' },
    pto: { expanded: 'Paid Time Off', entityType: 'Policy' },
    mfa: { expanded: 'Multi-Factor Authentication', entityType: 'Security' },
    sso: { expanded: 'Single Sign-On', entityType: 'Security' },
    sop: { expanded: 'Standard Operating Procedure', entityType: 'Policy' },
    nda: { expanded: 'Non-Disclosure Agreement', entityType: 'Security' },
    gdpr: { expanded: 'General Data Protection Regulation', entityType: 'Security' },
    ctc: { expanded: 'Cost to Company Salary', entityType: 'Employee Benefit' },
    kpi: { expanded: 'Key Performance Indicator', entityType: 'Policy' },
    iot: { expanded: 'Internet of Things', entityType: 'Technology' },
    etl: { expanded: 'Extract Transform Load Pipeline', entityType: 'Technology' },
    elt: { expanded: 'Extract Load Transform Pipeline', entityType: 'Technology' },
    ceo: { expanded: 'Chief Executive Officer', entityType: 'Leadership' },
    cto: { expanded: 'Chief Technology Officer', entityType: 'Leadership' },
    hq: { expanded: 'Headquarters', entityType: 'Office' },
    hr: { expanded: 'Human Resources', entityType: 'Department' },
  };

  private static readonly SYNONYM_MAP: Record<string, { canonical: string; intent: string; entityType: QueryEntity['type'] }> = {
    holiday: { canonical: 'Public Holiday Calendar', intent: 'Holiday Policy', entityType: 'Policy' },
    vacation: { canonical: 'Leave Policy', intent: 'Employee Leave Policy', entityType: 'Policy' },
    pto: { canonical: 'Paid Time Off Policy', intent: 'Employee Leave Policy', entityType: 'Policy' },
    leave: { canonical: 'Leave Policy', intent: 'Employee Leave Policy', entityType: 'Policy' },
    sick: { canonical: 'Sick Leave Policy', intent: 'Employee Leave Policy', entityType: 'Policy' },
    casual: { canonical: 'Casual Leave Policy', intent: 'Employee Leave Policy', entityType: 'Policy' },
    maternity: { canonical: 'Maternity Leave Policy', intent: 'Employee Leave Policy', entityType: 'Policy' },
    paternity: { canonical: 'Paternity Leave Policy', intent: 'Employee Leave Policy', entityType: 'Policy' },
    payroll: { canonical: 'Salary & Compensation Policy', intent: 'Employee Benefits', entityType: 'Employee Benefit' },
    salary: { canonical: 'Salary & Compensation Policy', intent: 'Employee Benefits', entityType: 'Employee Benefit' },
    remuneration: { canonical: 'Salary & Compensation Policy', intent: 'Employee Benefits', entityType: 'Employee Benefit' },
    insurance: { canonical: 'Health Insurance Coverage', intent: 'Employee Benefits', entityType: 'Employee Benefit' },
    medical: { canonical: 'Medical Coverage & Insurance', intent: 'Employee Benefits', entityType: 'Employee Benefit' },
    lakehouse: { canonical: 'Data Lakehouse Architecture', intent: 'Data Engineering & Analytics', entityType: 'Technology' },
    analytics: { canonical: 'Data Analytics & Business Intelligence', intent: 'Data Engineering & Analytics', entityType: 'Technology' },
    snowflake: { canonical: 'Snowflake Data Warehousing', intent: 'Data Engineering & Analytics', entityType: 'Technology' },
    bigquery: { canonical: 'Google BigQuery Data Warehousing', intent: 'Data Engineering & Analytics', entityType: 'Technology' },
    databricks: { canonical: 'Databricks Data Engineering', intent: 'Data Engineering & Analytics', entityType: 'Technology' },
    telemetry: { canonical: 'IoT Telemetry Ingestion', intent: 'IoT & Embedded Systems', entityType: 'Technology' },
    firmware: { canonical: 'Firmware Connectivity', intent: 'IoT & Embedded Systems', entityType: 'Technology' },
    edge: { canonical: 'Edge Computing Solutions', intent: 'IoT & Embedded Systems', entityType: 'Technology' },
  };

  /**
   * Main Query Intelligence Entry Point.
   * Transforms raw user query into a clean normalized query and a high-density semantic query.
   */
  public analyzeQuery(rawQuery: string, options: QueryIntelligenceOptions = {}): QueryIntelligenceResult {
    const cleanRaw = rawQuery ? rawQuery.trim() : '';
    if (!cleanRaw) {
      return {
        rawQuery: '',
        normalizedQuery: '',
        semanticQuery: '',
        intent: 'General Inquiry',
        entities: [],
        confidence: 0.0,
      };
    }

    // 1. Text Hygiene: Lowercase, trim, strip emojis & repeated punctuation
    let text = cleanRaw.toLowerCase();
    text = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ');
    text = text.replace(/([!?,;:.])\1+/g, '$1');
    text = text.replace(/[^\w\s./-]/g, ' ');
    text = text.replace(/\s+/g, ' ').trim();

    // 2. Spelling Correction
    const words = text.split(/\s+/);
    const correctedWords = words.map((w) => QueryIntelligenceService.SPELLING_TYPOS[w] || w);
    let normalized = correctedWords.join(' ');

    // 3. Abbreviation & Acronym Expansion
    const entities: QueryEntity[] = [];
    for (const [abbr, data] of Object.entries(QueryIntelligenceService.ABBREVIATIONS)) {
      const regex = new RegExp(`\\b${abbr.replace('/', '\\/')}\\b`, 'gi');
      if (regex.test(normalized)) {
        if (options.expandAbbreviations !== false) {
          normalized = normalized.replace(regex, data.expanded);
        }
        entities.push({
          type: data.entityType,
          value: abbr,
          normalized: data.expanded,
        });
      }
    }

    // 4. Synonym & Domain Entity Detection
    let detectedIntent = 'General Inquiry';
    for (const [term, data] of Object.entries(QueryIntelligenceService.SYNONYM_MAP)) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      if (regex.test(normalized)) {
        if (detectedIntent === 'General Inquiry') {
          detectedIntent = data.intent;
        }
        entities.push({
          type: data.entityType,
          value: term,
          normalized: data.canonical,
        });
      }
    }

    // 5. Word-Order Normalization (e.g. "leave maternity" -> "maternity leave")
    normalized = this.normalizeWordOrder(normalized);

    // 6. Intent Detection Rules
    detectedIntent = this.detectPrimaryIntent(normalized, detectedIntent);

    // 7. Extract Typed Entities (Technology, Policy, Leadership, Cloud, AI, Security, etc.)
    this.extractTypedEntities(normalized, entities);

    // Remove duplicates from entities
    const uniqueEntities = this.deduplicateEntities(entities);

    // 8. Generate Enriched Semantic Query for Vector Search
    const semanticQuery = this.buildSemanticRetrievalQuery(normalized, detectedIntent, uniqueEntities);

    // 9. Calculate Confidence
    const confidence = this.calculateConfidence(normalized, detectedIntent, uniqueEntities);

    return {
      rawQuery: cleanRaw,
      normalizedQuery: normalized,
      semanticQuery,
      intent: detectedIntent,
      entities: uniqueEntities,
      confidence,
    };
  }

  /**
   * Word Order Normalizer (e.g. "leave maternity" -> "maternity leave")
   */
  private normalizeWordOrder(text: string): string {
    let result = text;
    result = result.replace(/\bleave\s+maternity\b/gi, 'maternity leave');
    result = result.replace(/\bleave\s+paternity\b/gi, 'paternity leave');
    result = result.replace(/\bleave\s+sick\b/gi, 'sick leave');
    result = result.replace(/\bleave\s+casual\b/gi, 'casual leave');
    result = result.replace(/\bpolicy\s+holiday\b/gi, 'holiday policy');
    result = result.replace(/\bdeveloper\s+mobile\b/gi, 'mobile development');
    result = result.replace(/\bdeveloper\s+web\b/gi, 'web development');
    return result;
  }

  /**
   * Primary Intent Detector
   */
  private detectPrimaryIntent(text: string, currentIntent: string): string {
    const lower = text.toLowerCase();

    // Conversational Intent Priority (Intent > Entity: "Mobiloitte" does NOT trigger Company Profile)
    if (/\b(love|like|awesome|amazing|great|wonderful|best)\s+(you|mobiloitte|kaira)\b/i.test(lower)) {
      return 'Appreciation';
    }
    if (/\b(thank\s+you|thanks|thx|thankyou)\s*(mobiloitte|kaira)?\b/i.test(lower)) {
      return 'Thanks';
    }
    if (/\b(good\s+morning|good\s+afternoon|good\s+evening|hello|hi|hey)\s*(mobiloitte|kaira)?\b/i.test(lower)) {
      return 'Greeting';
    }

    if (/\b(mobile|android|ios|flutter|react native|kotlin|swift|app development)\b/i.test(lower)) {
      return 'Mobile Development';
    }
    if (/\b(web|website|react|next|angular|vue|node|express|frontend|backend|full stack)\b/i.test(lower)) {
      return 'Web Development';
    }
    if (/\b(artificial intelligence|generative ai|machine learning|deep learning|llm|nlp|computer vision|ai agent)\b/i.test(lower)) {
      return 'AI & Generative AI';
    }
    if (/\b(blockchain|web3|ethereum|smart contract|defi|nft|hyperledger|polygon|solidity)\b/i.test(lower)) {
      return 'Blockchain & Web3';
    }
    if (/\b(cloud|amazon web services|google cloud platform|azure|devops|kubernetes|docker|terraform|microservices)\b/i.test(lower)) {
      return 'Cloud & DevOps';
    }
    if (/\b(data engineering|analytics|data lakehouse|lakehouse|etl|elt|snowflake|bigquery|databricks|data pipeline)\b/i.test(lower)) {
      return 'Data Engineering & Analytics';
    }
    if (/\b(internet of things|iot|edge computing|telemetry|embedded systems|firmware|mqtt|coap)\b/i.test(lower)) {
      return 'IoT & Embedded Systems';
    }
    if (/\b(user interface|ui\/ux|design systems|figma|wireframe|prototype)\b/i.test(lower)) {
      return 'UI/UX Design';
    }
    if (/\b(quality assurance|test automation|qa|selenium|testing)\b/i.test(lower)) {
      return 'Quality Engineering';
    }
    if (/\b(leave|maternity|paternity|sick leave|casual leave|vacation|pto|paid time off)\b/i.test(lower)) {
      return 'Employee Leave Policy';
    }
    if (/\b(public holiday|holiday calendar|holiday policy|holiday list|holidays)\b/i.test(lower)) {
      return 'Holiday Policy';
    }
    if (/\b(salary|payroll|ctc|insurance|medical cover|health cover|reimbursement|allowance|benefits)\b/i.test(lower)) {
      return 'Employee Benefits';
    }
    if (/\b(security|gdpr|nda|mfa|password|compliance|confidentiality|soc 2|iso 27001)\b/i.test(lower)) {
      return 'Security & Compliance';
    }
    if (/\b(ceo|chief executive officer|jagdish harsh|cto|leadership|founder|executives|board of directors)\b/i.test(lower)) {
      return 'Leadership Information';
    }
    if (/\b(careers|jobs|vacancies|hiring|internships|openings|recruitment)\b/i.test(lower)) {
      return 'Careers & Openings';
    }
    if (/\b(headquarters|office|location|address|new delhi|boston|london|dubai|singapore)\b/i.test(lower)) {
      return 'Office Locations';
    }
    if (/\b(company profile|overview|about mobiloitte|facts|history|mission|vision)\b/i.test(lower)) {
      return 'Company Profile Inquiry';
    }
    return currentIntent;
  }

  /**
   * Extract Typed Entities
   */
  private extractTypedEntities(text: string, entities: QueryEntity[]): void {
    const lower = text.toLowerCase();
    const addEntity = (type: QueryEntity['type'], value: string, normalized: string) => {
      entities.push({ type, value, normalized });
    };

    if (/\b(react|node|angular|vue|python|java|flutter|kotlin|swift|golang|typescript)\b/i.test(lower)) {
      const match = lower.match(/\b(react|node|angular|vue|python|java|flutter|kotlin|swift|golang|typescript)\b/i);
      if (match) addEntity('Technology', match[0], match[0].toUpperCase());
    }
    if (/\b(aws|amazon web services|gcp|azure|docker|kubernetes)\b/i.test(lower)) {
      const match = lower.match(/\b(aws|amazon web services|gcp|azure|docker|kubernetes)\b/i);
      if (match) addEntity('Cloud', match[0], match[0]);
    }
    if (/\b(blockchain|ethereum|polygon|hyperledger|smart contract)\b/i.test(lower)) {
      const match = lower.match(/\b(blockchain|ethereum|polygon|hyperledger|smart contract)\b/i);
      if (match) addEntity('Blockchain', match[0], match[0]);
    }
    if (/\b(leave|maternity|paternity|sick|casual|holiday|vacation|pto)\b/i.test(lower)) {
      const match = lower.match(/\b(leave|maternity|paternity|sick|casual|holiday|vacation|pto)\b/i);
      if (match) addEntity('Policy', match[0], `${match[0]} policy`);
    }
    if (/\b(jagdish harsh|ceo|founder|cto|leadership)\b/i.test(lower)) {
      const match = lower.match(/\b(jagdish harsh|ceo|founder|cto|leadership)\b/i);
      if (match) addEntity('Leadership', match[0], match[0]);
    }
    if (/\b(new delhi|boston|london|dubai|singapore|headquarters|office)\b/i.test(lower)) {
      const match = lower.match(/\b(new delhi|boston|london|dubai|singapore|headquarters|office)\b/i);
      if (match) addEntity('Office', match[0], match[0]);
    }
  }

  /**
   * Build Semantic Retrieval Query for Vector Search
   */
  private buildSemanticRetrievalQuery(normalized: string, intent: string, entities: QueryEntity[]): string {
    const entityTokens = entities.map((e) => e.normalized).join(', ');
    const hasCompany = /mobiloitte/i.test(normalized);
    const companyPrefix = hasCompany ? '' : "Mobiloitte's ";

    switch (intent) {
      case 'Mobile Development':
        return `Explain ${companyPrefix}Mobile Application Engineering capabilities, technologies (iOS, Android, Flutter, React Native), frameworks, architecture and mobile app development process. ${entityTokens}`;

      case 'Web Development':
        return `Explain ${companyPrefix}Web Application Development capabilities, frontend and backend technologies (React, Next.js, Node.js, Angular), full-stack architecture and web engineering process. ${entityTokens}`;

      case 'AI & Generative AI':
        return `Explain ${companyPrefix}Artificial Intelligence, Generative AI, Machine Learning models, LLMs, NLP, Computer Vision and AI solution implementation. ${entityTokens}`;

      case 'Blockchain & Web3':
        return `Explain ${companyPrefix}Blockchain Solutions, Web3 engineering, Smart Contracts, Ethereum, Polygon, Hyperledger, DeFi and Tokenization capabilities. ${entityTokens}`;

      case 'Cloud & DevOps':
        return `Explain ${companyPrefix}Cloud Architecture, Development Operations, AWS, Azure, GCP, Kubernetes, Docker, CI/CD pipelines and infrastructure management. ${entityTokens}`;

      case 'Data Engineering & Analytics':
        return `Explain ${companyPrefix}Data Engineering, ETL/ELT pipelines, Data Lakehouse architecture, Snowflake, Databricks, BigQuery, data modeling and Business Intelligence. ${entityTokens}`;

      case 'IoT & Embedded Systems':
        return `Explain ${companyPrefix}Connected IoT Platforms, Edge Computing, telemetry ingestion pipelines, firmware connectivity, MQTT, CoAP, and Embedded Systems architecture. ${entityTokens}`;

      case 'UI/UX Design':
        return `Explain ${companyPrefix}UI/UX Experience Design Studio, human-centric design, wireframing, high-fidelity UI layout, design systems and interactive prototyping. ${entityTokens}`;

      case 'Quality Engineering':
        return `Explain ${companyPrefix}Quality Assurance, Test Automation, Selenium, manual testing, functional regression, API testing and test automation framework. ${entityTokens}`;

      case 'Employee Leave Policy':
        return `Explain ${companyPrefix}Employee Leave Policy, Annual Leave, Sick Leave, Casual Leave, Maternity Leave, Paternity Leave eligibility, duration, application procedure and leave balance encashment rules. ${entityTokens}`;

      case 'Holiday Policy':
        return `Explain ${companyPrefix}Public Holiday List, official holiday calendar, annual gazetted holidays and corporate holiday schedule. ${entityTokens}`;

      case 'Employee Benefits':
        return `Explain ${companyPrefix}Employee Benefits, Health Insurance coverage, Medical Policy, Salary compensation, payroll structure, perks and employee welfare programs. ${entityTokens}`;

      case 'Security & Compliance':
        return `Explain ${companyPrefix}Information Security Policy, GDPR compliance, NDA non-disclosure, Multi-Factor Authentication, ISO 27001, SOC 2, and data protection standards. ${entityTokens}`;

      case 'Leadership Information':
        return `Explain ${companyPrefix}Executive Leadership, Founder & Group CEO Jagdish Harsh, CTO, C-Suite Management Team and board of directors background. ${entityTokens}`;

      case 'Careers & Openings':
        return `Explain ${companyPrefix}Career opportunities, current job openings, hiring process, internship programs, work culture and recruitment details. ${entityTokens}`;

      case 'Office Locations':
        return `Explain ${companyPrefix}Global Offices directory, Headquarters in New Delhi India, regional offices in Boston USA, London UK, Dubai UAE, and Singapore. ${entityTokens}`;

      case 'Company Profile Inquiry':
        return `Explain ${companyPrefix}Company Overview, background, software engineering profile, mission, vision, core values and global presence. ${entityTokens}`;

      default:
        return `Explain ${companyPrefix}${normalized} details, policies, engineering capabilities, specifications and company procedures. ${entityTokens}`.trim();
    }
  }

  /**
   * Deduplicate Entities
   */
  private deduplicateEntities(entities: QueryEntity[]): QueryEntity[] {
    const seen = new Set<string>();
    const result: QueryEntity[] = [];
    for (const e of entities) {
      const key = `${e.type}:${e.normalized.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(e);
      }
    }
    return result;
  }

  /**
   * Calculate Confidence
   */
  private calculateConfidence(normalized: string, intent: string, entities: QueryEntity[]): number {
    if (intent !== 'General Inquiry') {
      return 0.90 + Math.min(entities.length * 0.03, 0.09);
    }
    return normalized.length > 5 ? 0.70 : 0.50;
  }
}

export const queryIntelligenceService = new QueryIntelligenceService();
