import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise AliasSchema definition for domain: "aliases"
 */
export const AliasSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type AliasRecord = z.infer<typeof AliasSchema>;
