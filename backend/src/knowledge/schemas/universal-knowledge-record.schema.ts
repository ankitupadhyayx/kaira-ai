import { z } from 'zod';
import { RecordStatusEnum, RecordStatus } from './shared/enums/record-enums';

/**
 * Stage 7.3 — Universal Knowledge Record Zod Schema & Enterprise Data Contract
 * Enforces strict snake_case naming conventions and standardized field groups across all domain records.
 */

export { RecordStatusEnum, RecordStatus };


export const IdentitySchema = z.object({
  id: z.string().min(1, 'Identity ID is required'),
  slug: z.string().min(1, 'Identity Slug is required'),
  domain: z.string().min(1, 'Domain name is required'),
  category: z.string().min(1, 'Category name is required'),
  subcategory: z.string().optional().nullable().default(null),
});
export type IdentityGroup = z.infer<typeof IdentitySchema>;

export const ContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  short_summary: z.string().default(''),
  detailed_description: z.string().default(''),
  highlights: z.array(z.string()).default([]),
  examples: z.array(z.string()).default([]),
  notes: z.array(z.string()).default([]),
});
export type ContentGroup = z.infer<typeof ContentSchema>;

export const SearchSchema = z.object({
  aliases: z.array(z.string()).default([]),
  synonyms: z.array(z.string()).default([]),
  abbreviations: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  search_phrases: z.array(z.string()).default([]),
  common_user_questions: z.array(z.string()).default([]),
  misspellings: z.array(z.string()).default([]),
  hinglish_variants: z.array(z.string()).default([]),
  plural_forms: z.array(z.string()).default([]),
  singular_forms: z.array(z.string()).default([]),
});
export type SearchGroup = z.infer<typeof SearchSchema>;

export const RelationshipsSchema = z.object({
  related_topics: z.array(z.string()).default([]),
  related_domains: z.array(z.string()).default([]),
  related_ids: z.array(z.string()).default([]),
  parent_id: z.string().optional().nullable().default(null),
  children_ids: z.array(z.string()).default([]),
});
export type RelationshipsGroup = z.infer<typeof RelationshipsSchema>;

export const MetadataSchema = z.object({
  version: z.string().default('1.0.0'),
  created_at: z.string().default(() => new Date().toISOString()),
  updated_at: z.string().default(() => new Date().toISOString()),
  created_by: z.string().default('system'),
  updated_by: z.string().default('system'),
  review_date: z.string().optional().nullable().default(null),
  language: z.string().default('en'),
  region: z.string().default('global'),
  source: z.string().default('internal'),
  confidence: z.number().min(0).max(1).default(1.0),
  priority: z.number().int().min(1).max(4).default(2),
});
export type MetadataGroup = z.infer<typeof MetadataSchema>;

export const TagsSchema = z.object({
  technology_tags: z.array(z.string()).default([]),
  business_tags: z.array(z.string()).default([]),
  department_tags: z.array(z.string()).default([]),
  industry_tags: z.array(z.string()).default([]),
});
export type TagsGroup = z.infer<typeof TagsSchema>;

export const ReferencesSchema = z.object({
  official_references: z.array(z.string()).default([]),
  documentation_urls: z.array(z.string()).default([]),
  internal_references: z.array(z.string()).default([]),
  external_references: z.array(z.string()).default([]),
});
export type ReferencesGroup = z.infer<typeof ReferencesSchema>;

export const FutureExpansionSchema = z.object({
  seo_metadata: z.record(z.unknown()).optional().nullable().default(null),
  analytics_metadata: z.record(z.unknown()).optional().nullable().default(null),
  permissions: z.record(z.unknown()).optional().nullable().default(null),
  vector_metadata: z.record(z.unknown()).optional().nullable().default(null),
  embeddings: z.record(z.unknown()).optional().nullable().default(null),
  localization: z.record(z.unknown()).optional().nullable().default(null),
});
export type FutureExpansionGroup = z.infer<typeof FutureExpansionSchema>;

export const UniversalKnowledgeRecordSchema = z.object({
  identity: IdentitySchema,
  content: ContentSchema,
  search: SearchSchema,
  relationships: RelationshipsSchema,
  metadata: MetadataSchema,
  status: RecordStatusEnum.default('active'),
  tags: TagsSchema,
  references: ReferencesSchema,
  future_expansion: FutureExpansionSchema.default({}),
});

export type UniversalKnowledgeRecord = z.infer<typeof UniversalKnowledgeRecordSchema>;
