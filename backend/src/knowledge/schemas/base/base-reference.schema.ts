import { z } from 'zod';
import { UniqueStringArray } from '../shared/reusable-validators/array-validators';

export const BaseReferenceSchema = z.object({
  official_references: UniqueStringArray,
  documentation_urls: UniqueStringArray,
  internal_references: UniqueStringArray,
  external_references: UniqueStringArray,
});

export type BaseReferenceGroup = z.infer<typeof BaseReferenceSchema>;
