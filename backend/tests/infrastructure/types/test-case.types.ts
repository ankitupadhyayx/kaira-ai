export type TestCaseTier = 'unit' | 'integration' | 'regression' | 'golden' | 'fuzz' | 'benchmark';
export type TestCaseStatus = 'pass' | 'fail' | 'skip' | 'pending';

// ─── Alias Test Case ──────────────────────────────────────────────────────────
export interface AliasSeedEntry {
  id: string;
  originalTerm: string;
  expectedResolution: string;
  datasetType: string;
  variants: string[];
  tags: string[];
}

export interface AliasTestCase {
  id: string;
  input: string;
  expectedResolution: string;
  datasetType: string;
  sourceVariant: string;
  tags: string[];
}

// ─── Synonym Test Case ────────────────────────────────────────────────────────
export interface SynonymSeedEntry {
  id: string;
  canonicalTerm: string;
  synonymGroup: string[];
  category: string;
  tags: string[];
}

export interface SynonymTestCase {
  id: string;
  input: string;
  expectedCanonical: string;
  sourceGroup: string;
  category: string;
}

// ─── Typo Test Case ───────────────────────────────────────────────────────────
export interface TypoSeedEntry {
  id: string;
  correctTerm: string;
  typoVariants: string[];
  mutationType: 'transposition' | 'deletion' | 'insertion' | 'substitution' | 'keyboard_adjacent';
}

export interface TypoTestCase {
  id: string;
  input: string;
  expectedCorrection: string;
  mutationType: string;
  editDistance: number;
}

// ─── Multi-Intent Test Case ───────────────────────────────────────────────────
export interface MultiIntentSeedEntry {
  id: string;
  firstClause: string;
  secondClause: string;
  expectedIntents: string[];
  conjunctions: string[];
}

export interface MultiIntentTestCase {
  id: string;
  fullQuery: string;
  expectedSegmentCount: number;
  expectedIntents: string[];
  conjunctionUsed: string;
}

// ─── Ambiguity Test Case ──────────────────────────────────────────────────────
export interface AmbiguitySeedEntry {
  id: string;
  query: string;
  competingIntents: string[];
  expectedResolution: 'RESOLVED' | 'CLARIFICATION_REQUIRED';
  expectedWinner?: string;
  discriminatorToken?: string;
}

export interface AmbiguityTestCase {
  id: string;
  query: string;
  competingIntents: string[];
  expectedResolution: 'RESOLVED' | 'CLARIFICATION_REQUIRED';
  expectedWinner?: string;
}

// ─── Golden Query Test Case ───────────────────────────────────────────────────
export interface GoldenQueryEntry {
  id: string;
  query: string;
  expectedIntentId: string | null; // null = rag-only; FastPath must NOT handle
  expectedConfidenceMin: number;
  tier: string;
  tags: string[];
  notes?: string;
}

// ─── Benchmark Result ─────────────────────────────────────────────────────────
export interface BenchmarkResult {
  testName: string;
  iterationsRun: number;
  totalDurationMs: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p90LatencyMs: number;
  p99LatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  passedCount: number;
  failedCount: number;
}

// ─── Regression Result ────────────────────────────────────────────────────────
export interface RegressionResult {
  goldenEntryId: string;
  query: string;
  expectedIntentId: string | null;
  actualIntentId: string | undefined;
  expectedConfidenceMin: number;
  actualConfidence: number;
  passed: boolean;
  reason?: string;
}

// ─── Fuzz Result ──────────────────────────────────────────────────────────────
export interface FuzzResult {
  input: string;
  crashed: boolean;
  errorMessage?: string;
  latencyMs: number;
  engineHandled: boolean;
}
