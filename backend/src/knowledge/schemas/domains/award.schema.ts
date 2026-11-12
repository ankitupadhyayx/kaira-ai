import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise AwardSchema definition for domain: "awards"
 */
export const AwardSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type AwardRecord = z.infer<typeof AwardSchema>;
