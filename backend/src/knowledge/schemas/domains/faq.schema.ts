import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise FAQSchema definition for domain: "faq"
 */
export const FAQSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type FAQRecord = z.infer<typeof FAQSchema>;
