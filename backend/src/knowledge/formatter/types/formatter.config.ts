export interface FormatterConfig {
  includeTitle?: boolean;
  includeSummary?: boolean;
  includeHighlights?: boolean;
  includeReferences?: boolean;
  includeFollowupSuggestions?: boolean;
  includeFooterMetadata?: boolean;
  maxFollowupCount?: number;
}

export const DEFAULT_FORMATTER_CONFIG: FormatterConfig = {
  includeTitle: true,
  includeSummary: true,
  includeHighlights: true,
  includeReferences: true,
  includeFollowupSuggestions: true,
  includeFooterMetadata: false,
  maxFollowupCount: 3,
};
