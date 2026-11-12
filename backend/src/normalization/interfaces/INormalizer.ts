import { ProcessingContext } from '../types/processing-context.types';

export interface INormalizerStage<TInput = string, TOutput = string> {
  readonly name: string;
  process(input: TInput, context?: ProcessingContext): TOutput;
}

export interface IUniversalNormalizer {
  process(rawInput: string | null | undefined): ProcessingContext;
}
