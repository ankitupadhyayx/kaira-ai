export type ResponseType =
  | 'Greeting'
  | 'Farewell'
  | 'Acknowledgement'
  | 'Company Information'
  | 'Service Information'
  | 'Technology Information'
  | 'Leadership'
  | 'Hiring'
  | 'FAQ'
  | 'Policy'
  | 'Contact'
  | 'Location'
  | 'List'
  | 'Comparison'
  | 'Definition'
  | 'Procedure'
  | 'Error'
  | 'Fallback';

export type ResponseDepth = 1 | 2 | 3 | 4;

export interface ChatResponseSection {
  heading: string;
  content: string | string[];
}

export interface ChatResponseAction {
  label: string;
  action: string;
  payload?: any;
}

export interface ChatResponse {
  type: ResponseType;
  depth: ResponseDepth;
  title: string;
  subtitle?: string;
  summary: string;
  body?: string;
  sections?: ChatResponseSection[];
  highlights?: string[];
  relatedTopics?: string[];
  followUpQuestions?: string[];
  references?: string[];
  metadata?: Record<string, any>;
  actions?: ChatResponseAction[];
  markdownText: string;
}

export interface FormattedKnowledgeResponse extends ChatResponse {
  mainAnswer: string;
  suggestedFollowups?: string[];
  metadataText?: string;
  formattingTimeMs: number;
}
