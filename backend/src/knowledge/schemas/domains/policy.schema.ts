import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise PolicySchema definition for domain: "policies"
 */
export const PolicySchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type PolicyRecord = z.infer<typeof PolicySchema>;
