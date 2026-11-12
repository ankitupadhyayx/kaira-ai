import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise SecuritySchema definition for domain: "security"
 */
export const SecuritySchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type SecurityRecord = z.infer<typeof SecuritySchema>;
