import { RankedIntentCandidate } from '../../candidate-generator/types/candidate-generator.types';

export type DisambiguationStatus = 'RESOLVED' | 'CLARIFICATION_REQUIRED' | 'UNRESOLVED';

export interface ClarificationOption {
  label: string;
  intentId: string;
}

export interface ClarificationPayload {
  questionText: string;
  options: ClarificationOption[];
  competingCandidates: RankedIntentCandidate[];
}

export interface DomainPriorityRule {
  domain: string;
  level: number;
}

export interface ConflictRule {
  ruleId: string;
  competingIntents: string[];
  tokenTriggers: string[];
  winnerIntentId: string;
  resolutionStrategy: 'TOKEN_TRIGGER_OVERRIDE' | 'PRIORITY_LEVEL_OVERRIDE';
}

export interface ClarificationTemplate {
  intentPair: string[];
  questionText: string;
  options: ClarificationOption[];
}

export interface DisambiguationDataset {
  version: string;
  description: string;
  priorityHierarchy: DomainPriorityRule[];
  conflictRules: ConflictRule[];
  clarificationTemplates: ClarificationTemplate[];
}

export interface PriorityResolutionResult {
  status: DisambiguationStatus;
  winnerCandidate: RankedIntentCandidate | null;
  competingCandidates: RankedIntentCandidate[];
  clarificationPayload: ClarificationPayload | null;
  resolutionStrategy: string;
  explanation: string;
}
