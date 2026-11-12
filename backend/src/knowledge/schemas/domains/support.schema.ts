import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise SupportSchema definition for domain: "support"
 */
export const SupportSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type SupportRecord = z.infer<typeof SupportSchema>;
