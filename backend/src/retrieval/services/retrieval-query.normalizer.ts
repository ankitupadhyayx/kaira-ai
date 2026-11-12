/**
 * Topic entity keywords used by the Retrieval Verification Gate.
 * Maps a detected topic to the keywords that MUST appear in at least one retrieved chunk.
 * Rule: A chunk is valid ONLY if it contains at least one keyword from the matched topic's list.
 * Generic overview chunks (company background, core services overview) are NEVER valid for specific topics.
 */
export const TOPIC_VERIFICATION_MAP: Record<string, string[]> = {
  // ── HR Policies ────────────────────────────────────────────────────────────
  holiday: ['holiday', 'public holiday', 'annual holiday', 'calendar', 'festive', 'national holiday', 'gazetted', 'paid holiday'],
  leave: ['leave', 'annual', 'sick', 'casual', 'earned', 'maternity', 'paternity', 'vacation', 'time off', 'pto'],
  'medical leave': ['medical', 'sick', 'leave', 'emergency', 'health'],
  'sick leave': ['sick', 'leave', 'medical', 'health', 'emergency'],
  attendance: ['attendance', 'timing', 'hours', 'shift', 'check-in', 'check-out', 'working hours', 'clock'],
  'work timing': ['timing', 'hours', 'shift', 'working hours', 'office hours'],
  benefits: ['benefit', 'insurance', 'medical', 'perk', 'allowance', 'coverage', 'welfare'],
  insurance: ['insurance', 'medical', 'health', 'coverage', 'policy', 'premium'],
  salary: ['salary', 'pay', 'payroll', 'compensation', 'ctc', 'package', 'wage', 'stipend'],
  promotion: ['promotion', 'appraisal', 'merit', 'increment', 'raise', 'career growth', 'performance'],
  training: ['training', 'development', 'program', 'upskill', 'workshop', 'learning', 'course'],
  'career growth': ['career', 'growth', 'promotion', 'mentorship', 'learning', 'development'],
  'leave encashment': ['encashment', 'earned leave', 'leave balance', 'leave surrender'],
  password: ['password', 'mfa', 'authentication', 'security', 'access', 'credentials'],
  gdpr: ['gdpr', 'data protection', 'privacy', 'personal data', 'regulation'],
  nda: ['nda', 'non-disclosure', 'confidentiality', 'agreement'],
  expense: ['expense', 'reimbursement', 'claim', 'travel', 'bill', 'receipt'],
  grievance: ['grievance', 'complaint', 'disciplinary', 'termination', 'notice period', 'resignation'],
  onboarding: ['onboarding', 'joining', 'induction', 'probation', 'new hire', 'orientation'],

  // ── Web Development ────────────────────────────────────────────────────────
  'web development': ['web', 'frontend', 'backend', 'next.js', 'react', 'angular', 'vue', 'node.js', 'api', 'html', 'css', 'javascript', 'typescript', 'full stack', 'mern', 'mean'],
  'web application': ['web application', 'web app', 'frontend', 'backend', 'react', 'next.js', 'api', 'full stack'],
  frontend: ['frontend', 'react', 'angular', 'vue', 'next.js', 'html', 'css', 'javascript', 'tailwind', 'ui', 'ux'],
  backend: ['backend', 'node.js', 'express', 'nestjs', 'django', 'fastapi', 'spring', 'laravel', 'rest', 'graphql', 'api'],
  'full stack': ['full stack', 'mern', 'mean', 'react', 'node', 'next.js', 'frontend', 'backend'],
  'api development': ['api', 'rest', 'graphql', 'grpc', 'endpoint', 'microservice', 'swagger', 'openapi'],

  // ── Mobile / App Development ───────────────────────────────────────────────
  'app development': ['android', 'ios', 'flutter', 'react native', 'swift', 'kotlin', 'mobile', 'app store', 'play store'],
  'mobile development': ['mobile', 'android', 'ios', 'flutter', 'react native', 'swift', 'kotlin', 'hybrid', 'ionic'],
  android: ['android', 'kotlin', 'java', 'play store', 'apk', 'android studio'],
  ios: ['ios', 'swift', 'objective-c', 'xcode', 'app store', 'iphone', 'ipad'],
  flutter: ['flutter', 'dart', 'cross-platform', 'ios', 'android'],
  'react native': ['react native', 'javascript', 'cross-platform', 'ios', 'android'],

  // ── AI / ML ────────────────────────────────────────────────────────────────
  'artificial intelligence': ['ai', 'machine learning', 'deep learning', 'model', 'neural network', 'tensorflow', 'pytorch', 'nlp', 'llm', 'generative'],
  'machine learning': ['machine learning', 'ml', 'model', 'training', 'tensorflow', 'pytorch', 'scikit', 'deep learning', 'dataset'],
  'generative ai': ['generative ai', 'llm', 'gpt', 'gemini', 'claude', 'llama', 'rag', 'prompt', 'fine-tuning'],
  'ai development': ['ai', 'model', 'llm', 'rag', 'machine learning', 'generative', 'nlp', 'computer vision'],
  nlp: ['nlp', 'natural language', 'text processing', 'sentiment', 'ner', 'bert', 'transformer'],
  rag: ['rag', 'retrieval augmented', 'vector', 'embedding', 'pgvector', 'knowledge base', 'llm'],

  // ── Blockchain / Web3 ──────────────────────────────────────────────────────
  blockchain: ['blockchain', 'smart contract', 'solidity', 'ethereum', 'polygon', 'hyperledger', 'defi', 'nft', 'web3', 'dapp'],
  'smart contract': ['smart contract', 'solidity', 'ethereum', 'polygon', 'audit', 'erc-20', 'erc-721'],
  'web3': ['web3', 'defi', 'nft', 'wallet', 'blockchain', 'crypto', 'tokenization', 'dao'],
  defi: ['defi', 'staking', 'liquidity', 'protocol', 'blockchain', 'yield', 'smart contract'],
  nft: ['nft', 'marketplace', 'erc-721', 'minting', 'blockchain', 'opensea'],

  // ── Cloud / DevOps ─────────────────────────────────────────────────────────
  cloud: ['cloud', 'aws', 'azure', 'gcp', 'google cloud', 'infrastructure', 'serverless', 'migration', 's3', 'ec2'],
  aws: ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'cloudfront', 'rds', 'eks'],
  azure: ['azure', 'microsoft azure', 'ad', 'devops', 'azure functions', 'blob storage'],
  devops: ['devops', 'ci/cd', 'docker', 'kubernetes', 'jenkins', 'github actions', 'terraform', 'ansible', 'pipeline'],
  docker: ['docker', 'container', 'dockerfile', 'compose', 'image', 'registry'],
  kubernetes: ['kubernetes', 'k8s', 'pod', 'deployment', 'cluster', 'helm', 'orchestration'],
  'ci/cd': ['ci/cd', 'continuous integration', 'continuous delivery', 'jenkins', 'github actions', 'pipeline', 'deployment'],

  // ── Security ───────────────────────────────────────────────────────────────
  security: ['security', 'mfa', 'vpn', 'vulnerability', 'penetration', 'vapt', 'owasp', 'zero-trust', 'encryption', 'audit'],
  mfa: ['mfa', 'multi-factor', 'authenticator', '2fa', 'otp', 'authentication'],
  compliance: ['compliance', 'iso', 'gdpr', 'hipaa', 'pci-dss', 'cmmi', 'certification', 'audit'],

  // ── Industry Verticals ─────────────────────────────────────────────────────
  healthcare: ['healthcare', 'hipaa', 'ehr', 'telemedicine', 'hospital', 'clinic', 'patient', 'medical system'],
  fintech: ['fintech', 'payment', 'banking', 'wallet', 'trading', 'pci', 'fraud', 'financial', 'lending'],
  ecommerce: ['ecommerce', 'e-commerce', 'marketplace', 'cart', 'product', 'order', 'inventory', 'omnichannel'],
  logistics: ['logistics', 'fleet', 'tracking', 'route', 'supply chain', 'warehouse', 'delivery', 'iot'],
  education: ['lms', 'e-learning', 'course', 'classroom', 'curriculum', 'student', 'gamification', 'edtech'],
  'real estate': ['real estate', 'proptech', 'property', 'lease', 'virtual tour', 'listing', 'smart building'],
  government: ['government', 'smart city', 'e-governance', 'digital id', 'public sector', 'civic'],

  // ── Products ───────────────────────────────────────────────────────────────
  blocksuite: ['blocksuite', 'smart contract', 'blockchain', 'erc-20', 'testnet', 'deployment framework'],
  genai: ['genaI', 'documentbot', 'rag', 'pdf', 'knowledge retrieval', 'hallucination', 'enterprise ai'],
  iot: ['iot', 'tracker', 'sensor', 'telemetry', 'fleet', 'dashboard', 'edge computing'],

  // ── Careers / Hiring ───────────────────────────────────────────────────────
  careers: ['career', 'jobs', 'hiring', 'internship', 'recruitment', 'apply', 'hr@mobiloitte.com', 'open roles'],
  internship: ['internship', 'intern', 'stipend', 'certificate', 'campus', 'project', 'mentorship'],
  hiring: ['hiring', 'recruitment', 'interview', 'resume', 'shortlist', 'offer', 'onboarding'],
};

export class RetrievalQueryNormalizer {
  private static readonly ACRONYMS: Record<string, string> = {
    mfa: 'multi-factor authentication',
    hq: 'headquarters',
    ceo: 'chief executive officer founder',
    cto: 'chief technology officer',
    hr: 'human resources recruitment hiring',
    qa: 'quality assurance software testing',
    ai: 'artificial intelligence generative ai machine learning',
    ml: 'machine learning artificial intelligence',
    nlp: 'natural language processing',
    llm: 'large language model',
    rag: 'retrieval augmented generation',
    wfh: 'work from home remote work policy',
    sop: 'standard operating procedure policy',
    nda: 'non disclosure agreement privacy confidentiality',
    gdpr: 'general data protection regulation privacy',
    aws: 'amazon web services cloud',
    gcp: 'google cloud platform',
    pto: 'paid time off leave policy annual leave',
    ctc: 'cost to company salary compensation package',
    kpi: 'key performance indicator appraisal evaluation',
    eap: 'employee assistance program wellness benefits',
    esop: 'employee stock ownership plan equity benefits',
    ppe: 'personal protective equipment safety policy',
    wbs: 'work breakdown structure project management',
  };

  private static readonly HINGLISH_MAP: Record<string, string> = {
    kahan: 'location office where',
    kaun: 'who leadership founder ceo',
    kya: 'what services details',
    kab: 'when date founded history',
    kaise: 'how process methodology',
    kaunse: 'which frameworks technologies',
    banate: 'develop build engineering services',
    kaam: 'work projects services',
    pata: 'address location headquarters',
    chhutti: 'leave holiday vacation',
    kamai: 'salary compensation pay',
    inshurans: 'insurance medical coverage',
    tankhwah: 'salary compensation pay',
    niyam: 'policy rules guidelines',
    aadar: 'attendance presence working',
  };

  /**
   * Normalizes raw user input into a clean, canonical semantic retrieval query.
   * Handles typos, repeated characters, acronym expansion, Hinglish translation,
   * and semantic intent rewrites without destructive rewriting of domain terms.
   */
  public normalizeForRetrieval(rawQuery: string): string {
    if (!rawQuery || typeof rawQuery !== 'string') return '';

    let text = rawQuery.trim().toLowerCase();

    // 0. Accent Removal & Unicode Normalization (e.g. "médical" -> "medical", "résumé" -> "resume")
    text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 1. Clean punctuation except hyphens/dots in tech names
    text = text.replace(/[^\w\s.-]/g, ' ');

    // 2. Collapse repeated characters (e.g. "whereee islocatedd" -> "where islocated")
    text = text.replace(/(.)\1{2,}/g, '$1');

    // 3. Handle specific misspellings/merged words & enterprise dictionary terms
    text = text.replace(/\bmobiloite\b/gi, 'mobiloitte');
    text = text.replace(/\bmobiloitee\b/gi, 'mobiloitte');
    text = text.replace(/\bmobiliotte\b/gi, 'mobiloitte');
    text = text.replace(/\borganiztion\b/gi, 'organization');
    text = text.replace(/\bartifical\b/gi, 'artificial');
    text = text.replace(/\bpolicys\b/gi, 'policies');
    text = text.replace(/\bceoo\b/gi, 'ceo');
    text = text.replace(/\bfouder\b/gi, 'founder');
    text = text.replace(/\bislocated\b/gi, 'office location');

    // Enterprise Dictionary Expansions
    text = text.replace(/\bgen\s+ai\b/gi, 'generative artificial intelligence');
    text = text.replace(/\bci\s+cd\b/gi, 'continuous integration continuous delivery');
    text = text.replace(/\breact\s+native\b/gi, 'react native mobile development');

    // 4. Precise Semantic Intent Rewrites
    // HR Leave & Attendance
    text = text.replace(/\bholiday\s+(?:policy|list|calendar|schedule)\b/gi, 'public holiday list calendar annual holiday schedule');
    text = text.replace(/\bpublic\s+holidays?\b/gi, 'public holiday list calendar annual holiday employee');
    text = text.replace(/\bholidays?\s+in\s+\w+/gi, 'public holiday list calendar annual holiday employee');
    text = text.replace(/\bholidays?\b/gi, 'public holiday list calendar annual holiday employee');
    text = text.replace(/\bpaid\s+leave\b/gi, 'paid leave employee leave policy');
    text = text.replace(/\bmedical\s+leave\b/gi, 'medical leave sick leave employee leave policy');
    text = text.replace(/\bsick\s+leave\b/gi, 'sick leave medical leave employee leave policy');
    text = text.replace(/\bcasual\s+leave\b/gi, 'casual leave employee leave policy');
    text = text.replace(/\bearned\s+leave\b/gi, 'earned leave leave encashment employee policy');
    text = text.replace(/\bleave\s+encashment\b/gi, 'leave encashment earned leave surrender policy');
    text = text.replace(/\bmaternity\s+leave\b/gi, 'maternity leave parental policy employee');
    text = text.replace(/\bpaternity\s+leave\b/gi, 'paternity leave parental policy employee');
    text = text.replace(/\battendance\b/gi, 'attendance policy working hours office timing');
    text = text.replace(/\bwork\s+timing\b/gi, 'working hours policy office timing shift schedule');
    text = text.replace(/\boffice\s+hours?\b/gi, 'working hours policy office timing schedule');
    text = text.replace(/\bworking\s+hours?\b/gi, 'working hours policy office timing attendance');

    // HR Compensation & Benefits
    text = text.replace(/\bemployee\s+benefits?\b/gi, 'employee benefits HR policy welfare');
    text = text.replace(/\bhealth\s+insurance\b/gi, 'health insurance medical coverage employee benefits policy');
    text = text.replace(/\bmedical\s+insurance\b/gi, 'medical insurance health coverage employee benefits policy');
    text = text.replace(/\binsurance\b/gi, 'insurance health coverage employee benefits policy');
    text = text.replace(/\bsalary\s+structure\b/gi, 'salary structure compensation payroll CTC employee');
    text = text.replace(/\bpromotion\b/gi, 'promotion appraisal merit career growth policy');
    text = text.replace(/\bappraisal\b/gi, 'appraisal performance review promotion merit policy');
    text = text.replace(/\bincrement\b/gi, 'salary increment merit increase appraisal policy');

    // HR Development
    text = text.replace(/\btraining\s+program\b/gi, 'employee training development program upskilling');
    text = text.replace(/\btraining\b/gi, 'employee training development program');
    text = text.replace(/\bcareer\s+growth\b/gi, 'career growth development promotion mentorship policy');
    text = text.replace(/\bonboarding\b/gi, 'employee onboarding joining process HR policy');
    text = text.replace(/\bcode\s+of\s+conduct\b/gi, 'code of conduct employee policy HR guidelines');

    // Location
    text = text.replace(/\bwhere\s+is\s+located\b/gi, 'office location headquarters address');
    text = text.replace(/\blocation\b/gi, 'office location headquarters address');

    // Technology (safe, non-destructive)
    text = text.replace(/\bpricing\b/gi, 'pricing estimation cost');
    text = text.replace(/\bai\s+development\b/gi, 'AI services development');

    // 5. Fix destructive 'education' rewrite — only rewrite if in context of industry verticals
    text = text.replace(/\beducation\s+(?:sector|industry|vertical|domain)\b/gi, 'education industry vertical domain');
    // NOTE: bare "education" alone is NOT rewritten — prevents misdirected queries

    // 6. Tokenize and apply Acronym & Hinglish mapping
    const tokens = text.split(/\s+/).filter(Boolean);
    const normalizedTokens: string[] = [];

    for (const token of tokens) {
      if (RetrievalQueryNormalizer.ACRONYMS[token]) {
        normalizedTokens.push(RetrievalQueryNormalizer.ACRONYMS[token]);
      } else if (RetrievalQueryNormalizer.HINGLISH_MAP[token]) {
        normalizedTokens.push(RetrievalQueryNormalizer.HINGLISH_MAP[token]);
      } else {
        normalizedTokens.push(token);
      }
    }

    return normalizedTokens.join(' ').trim();
  }

  /**
   * Extracts the primary topic entity keywords from the original (pre-normalized) query.
   * Used by the Retrieval Verification Gate to confirm retrieved chunks are on-topic.
   */
  public extractTopicKeywords(rawQuery: string): string[] {
    if (!rawQuery) return [];
    const q = rawQuery.toLowerCase().trim();

    // Priority 1: Match longest topic phrase first (prevents partial matches)
    const sortedTopics = Object.keys(TOPIC_VERIFICATION_MAP).sort((a, b) => b.length - a.length);
    for (const topic of sortedTopics) {
      if (q.includes(topic)) {
        return TOPIC_VERIFICATION_MAP[topic];
      }
    }

    // Priority 2: Single-word technology/service terms that must be chunk-verified
    const techSingleWords: Record<string, string[]> = {
      react: ['react', 'jsx', 'component', 'hook', 'next.js'],
      angular: ['angular', 'typescript', 'rxjs', 'module'],
      vue: ['vue', 'nuxt', 'vuex', 'component'],
      flutter: ['flutter', 'dart', 'widget', 'mobile'],
      kotlin: ['kotlin', 'android', 'coroutine', 'jetpack'],
      swift: ['swift', 'ios', 'xcode', 'uikit', 'swiftui'],
      python: ['python', 'django', 'fastapi', 'flask', 'ml', 'pytorch'],
      nodejs: ['node', 'express', 'nestjs', 'npm', 'javascript'],
      django: ['django', 'python', 'orm', 'rest', 'backend'],
      solidity: ['solidity', 'smart contract', 'ethereum', 'evm'],
      ethereum: ['ethereum', 'evm', 'solidity', 'web3', 'defi'],
      polygon: ['polygon', 'layer2', 'matic', 'ethereum'],
      tensorflow: ['tensorflow', 'ml', 'neural', 'model', 'training'],
      pytorch: ['pytorch', 'ml', 'neural', 'tensor', 'gradient'],
    };
    for (const [word, kws] of Object.entries(techSingleWords)) {
      if (q.includes(word)) return kws;
    }

    // Priority 3: Fallback — return significant tokens from query (>= 4 chars, no stopwords)
    const stopwords = new Set(['what', 'when', 'where', 'which', 'does', 'have', 'that', 'this', 'with', 'from', 'about', 'tell', 'know', 'give', 'want', 'your']);
    return rawQuery
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 4 && !stopwords.has(t));
  }
}

export const retrievalQueryNormalizer = new RetrievalQueryNormalizer();
