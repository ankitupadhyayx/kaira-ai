import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise GlossarySchema definition for domain: "glossary"
 */
export const GlossarySchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type GlossaryRecord = z.infer<typeof GlossarySchema>;
