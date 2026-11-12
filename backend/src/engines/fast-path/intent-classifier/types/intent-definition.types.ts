export interface IntentConfidenceRules {
  baseConfidence: number;              // Base confidence when required tokens match (e.g., 0.80)
  requiredTokenMatchBonus: number;     // Bonus for complete required token set match (e.g., 0.10)
  optionalTokenMatchBonus: number;     // Bonus per optional token matched (e.g., 0.05)
  negativeTokenPenalty: number;        // Penalty when negative tokens match (e.g., 0.50)
  exactMatchBonus: number;             // Bonus when query exactly matches intent phrase (e.g., 0.10)
  minConfidenceThreshold: number;      // Threshold for considering a match valid (e.g., 0.65)
}

export interface IntentDefinition {
  /** Unique standardized ID (e.g. 'LEADERSHIP.CEO', 'SERVICE.AI') */
  id: string;

  /** Domain namespace (e.g. 'LEADERSHIP', 'COMPANY', 'SERVICE') */
  domain: string;

  /** Human-readable category description */
  category: string;

  /** Priority level (1 = Critical, 2 = High, 3 = Medium, 4 = Low) */
  priority: number;

  /** Confidence scoring parameters */
  confidenceRules: IntentConfidenceRules;

  /**
   * Required token sets.
   * Outer array = OR conditions; Inner array = AND tokens.
   * E.g., [['ceo'], ['chief', 'executive']]
   */
  requiredTokens: string[][];

  /** Optional tokens that boost confidence when present */
  optionalTokens: string[];

  /** Negative tokens that penalize or invalidate the match */
  negativeTokens: string[];

  /** Related intent IDs for context expansion */
  relatedIntents: string[];

  /** Recommended follow-up prompts */
  followUpSuggestions: string[];

  /** Standardized direct response template for FastPath execution */
  responseTemplate?: string;

  /** Additional structured metadata */
  metadata?: Record<string, unknown>;
}
