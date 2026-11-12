import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise CareerSchema definition for domain: "careers"
 */
export const CareerSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type CareerRecord = z.infer<typeof CareerSchema>;
