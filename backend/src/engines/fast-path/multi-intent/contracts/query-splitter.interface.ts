import { QuerySegment } from '../types/multi-intent.types';

export interface IQuerySplitter {
  splitQuery(query: string): QuerySegment[];
}
