import { z } from 'zod';
import { IdField, SlugField } from '../shared/field-definitions/common-fields';
import { RecordStatusEnum } from '../shared/enums/record-enums';
import { BaseMetadataSchema } from './base-metadata.schema';
import { BaseSearchSchema } from './base-search.schema';
import { BaseRelationshipSchema } from './base-relationship.schema';
import { BaseReferenceSchema } from './base-reference.schema';

export const BaseIdentitySchema = z.object({
  id: IdField,
  slug: SlugField,
  domain: z.string().min(1, 'Domain name is required'),
  category: z.string().min(1, 'Category name is required'),
  subcategory: z.string().optional().nullable().default(null),
});

export const BaseContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  short_summary: z.string().default(''),
  detailed_description: z.string().default(''),
  highlights: z.array(z.string()).default([]),
  examples: z.array(z.string()).default([]),
  notes: z.array(z.string()).default([]),
});

export const BaseTagsSchema = z.object({
  technology_tags: z.array(z.string()).default([]),
  business_tags: z.array(z.string()).default([]),
  department_tags: z.array(z.string()).default([]),
  industry_tags: z.array(z.string()).default([]),
});

export const BaseFutureExpansionSchema = z.object({
  seo_metadata: z.record(z.unknown()).optional().nullable().default(null),
  analytics_metadata: z.record(z.unknown()).optional().nullable().default(null),
  permissions: z.record(z.unknown()).optional().nullable().default(null),
  vector_metadata: z.record(z.unknown()).optional().nullable().default(null),
  embeddings: z.record(z.unknown()).optional().nullable().default(null),
  localization: z.record(z.unknown()).optional().nullable().default(null),
});

export const BaseKnowledgeSchema = z.object({
  identity: BaseIdentitySchema,
  content: BaseContentSchema,
  search: BaseSearchSchema,
  relationships: BaseRelationshipSchema,
  metadata: BaseMetadataSchema,
  status: RecordStatusEnum.default('active'),
  tags: BaseTagsSchema,
  references: BaseReferenceSchema,
  future_expansion: BaseFutureExpansionSchema.default({}),
});

export type BaseKnowledgeRecord = z.infer<typeof BaseKnowledgeSchema>;
