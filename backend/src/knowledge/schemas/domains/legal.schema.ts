import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise LegalSchema definition for domain: "legal"
 */
export const LegalSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type LegalRecord = z.infer<typeof LegalSchema>;
