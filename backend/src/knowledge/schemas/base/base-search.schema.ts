import { z } from 'zod';
import { UniqueStringArray } from '../shared/reusable-validators/array-validators';

export const BaseSearchSchema = z.object({
  aliases: UniqueStringArray,
  synonyms: UniqueStringArray,
  abbreviations: UniqueStringArray,
  keywords: UniqueStringArray,
  search_phrases: UniqueStringArray,
  common_user_questions: UniqueStringArray,
  misspellings: UniqueStringArray,
  hinglish_variants: UniqueStringArray,
  plural_forms: UniqueStringArray,
  singular_forms: UniqueStringArray,
});

export type BaseSearchGroup = z.infer<typeof BaseSearchSchema>;
