import { ProcessingContext } from '../../normalization/types/processing-context.types';

export interface EngineResult<TData = unknown> {
  /** Engine identifier (e.g., 'GreetingEngine') */
  engineName: string;

  /** True if the query was handled/matched by this engine */
  handled: boolean;

  /** Overall confidence score (0.0 to 1.0) */
  confidence: number;

  /** Detected intent name if any */
  intent?: string;

  /** Detailed category of match */
  category?: string;

  /** Engine-specific payload data */
  payload?: TData;

  /** Optional generated response candidate string */
  responseCandidate?: string;

  /** Residual ProcessingContext after splitting greeting (forwarded to downstream engines) */
  residualContext?: ProcessingContext;

  /** Structured metadata */
  metadata: Record<string, unknown>;
}

export interface IEngine<TResult = EngineResult> {
  readonly name: string;
  process(context: ProcessingContext, sessionId?: string): Promise<TResult> | TResult;
}
