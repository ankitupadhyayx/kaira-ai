export type Role = 'user' | 'assistant' | 'system';

export interface PromptSuggestion {
  id: string;
  label: string;
  icon?: string;
  prompt?: string;
  category?: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  isError?: boolean;
  category?: string;
  feedback?: 'like' | 'dislike' | null;
  suggestions?: PromptSuggestion[];
  debugBadge?: string;
  debugSource?: string;
}

export interface Conversation {
  id: string;
  title: string;
  lastUpdated: string;
  messages: Message[];
  category?: string;
  isPinned?: boolean;
  isEditing?: boolean;
}

export type DisplayMode = 'widget' | 'fullscreen';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
