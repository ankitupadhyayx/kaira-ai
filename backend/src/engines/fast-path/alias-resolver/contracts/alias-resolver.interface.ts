import { AliasResolutionResult } from '../types/alias-resolution.types';

export interface IAliasResolver {
  resolveQuery(query: string, sessionId?: string): AliasResolutionResult;
}
