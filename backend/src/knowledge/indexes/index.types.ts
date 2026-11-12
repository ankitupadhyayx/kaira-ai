import { BaseKnowledgeRecord } from '../schemas/base/base-knowledge.schema';

export interface KnowledgeIndexes {
  idIndex: Map<string, BaseKnowledgeRecord>;
  slugIndex: Map<string, BaseKnowledgeRecord>;
  aliasIndex: Map<string, BaseKnowledgeRecord[]>;
  keywordIndex: Map<string, BaseKnowledgeRecord[]>;
  categoryIndex: Map<string, BaseKnowledgeRecord[]>;
  statusIndex: Map<string, BaseKnowledgeRecord[]>;
  languageIndex: Map<string, BaseKnowledgeRecord[]>;
  tagIndex: Map<string, BaseKnowledgeRecord[]>;
  relationshipIndex: Map<string, string[]>;
  parentChildIndex: Map<string, string[]>;
  technologyIndex: Map<string, BaseKnowledgeRecord[]>;
  serviceIndex: Map<string, BaseKnowledgeRecord[]>;
  companyIndex: Map<string, BaseKnowledgeRecord[]>;
  leadershipIndex: Map<string, BaseKnowledgeRecord[]>;
  locationIndex: Map<string, BaseKnowledgeRecord[]>;
  policyIndex: Map<string, BaseKnowledgeRecord[]>;
  faqIndex: Map<string, BaseKnowledgeRecord[]>;
  supportIndex: Map<string, BaseKnowledgeRecord[]>;
}

export interface DuplicateDetectionReport {
  duplicateIds: string[];
  duplicateSlugs: string[];
  duplicateAliases: string[];
  totalDuplicates: number;
}
