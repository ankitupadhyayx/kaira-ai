import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise LeadershipSchema definition for domain: "leadership"
 */
export const LeadershipSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type LeadershipRecord = z.infer<typeof LeadershipSchema>;
