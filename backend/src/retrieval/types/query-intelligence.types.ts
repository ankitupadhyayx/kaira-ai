export interface QueryEntity {
  type: 'Technology' | 'Policy' | 'Leadership' | 'Department' | 'Employee Benefit' | 'Certification' | 'Industry' | 'Security' | 'Blockchain' | 'Cloud' | 'AI' | 'Office' | 'Contact' | 'General';
  value: string;
  normalized: string;
}

export interface QueryIntelligenceResult {
  rawQuery: string;
  normalizedQuery: string;
  semanticQuery: string;
  intent: string;
  entities: QueryEntity[];
  confidence: number;
}

export interface QueryIntelligenceOptions {
  expandAbbreviations?: boolean;
  normalizeWordOrder?: boolean;
  includeDomainEnrichment?: boolean;
}
