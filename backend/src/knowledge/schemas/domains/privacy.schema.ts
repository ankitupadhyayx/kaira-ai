import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise PrivacySchema definition for domain: "privacy"
 */
export const PrivacySchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type PrivacyRecord = z.infer<typeof PrivacySchema>;
