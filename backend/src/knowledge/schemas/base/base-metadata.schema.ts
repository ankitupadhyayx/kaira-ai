import { z } from 'zod';
import { ConfidenceField, IsoDateTimeField, PriorityField } from '../shared/field-definitions/common-fields';

export const BaseMetadataSchema = z.object({
  version: z.string().default('1.0.0'),
  created_at: IsoDateTimeField,
  updated_at: IsoDateTimeField,
  created_by: z.string().default('system'),
  updated_by: z.string().default('system'),
  review_date: z.string().optional().nullable().default(null),
  language: z.string().default('en'),
  region: z.string().default('global'),
  source: z.string().default('internal'),
  confidence: ConfidenceField,
  priority: PriorityField,
});

export type BaseMetadataGroup = z.infer<typeof BaseMetadataSchema>;
