import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise HiringSchema definition for domain: "hiring"
 */
export const HiringSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type HiringRecord = z.infer<typeof HiringSchema>;
