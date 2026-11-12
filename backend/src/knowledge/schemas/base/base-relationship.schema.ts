import { z } from 'zod';
import { UniqueStringArray } from '../shared/reusable-validators/array-validators';

export const BaseRelationshipSchema = z.object({
  related_topics: UniqueStringArray,
  related_domains: UniqueStringArray,
  related_ids: UniqueStringArray,
  parent_id: z.string().optional().nullable().default(null),
  children_ids: UniqueStringArray,
});

export type BaseRelationshipGroup = z.infer<typeof BaseRelationshipSchema>;
