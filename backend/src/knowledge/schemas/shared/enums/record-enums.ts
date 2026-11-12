import { z } from 'zod';

export const RecordStatusEnum = z.enum(['active', 'deprecated', 'draft', 'archived']);
export type RecordStatus = z.infer<typeof RecordStatusEnum>;

export const ErrorSeverityEnum = z.enum(['ERROR', 'WARNING', 'INFO']);
export type ErrorSeverity = z.infer<typeof ErrorSeverityEnum>;

export const PriorityLevelEnum = z.nativeEnum({
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
});
export type PriorityLevel = z.infer<typeof PriorityLevelEnum>;
