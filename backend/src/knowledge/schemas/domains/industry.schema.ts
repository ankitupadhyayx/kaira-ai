import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise IndustrySchema definition for domain: "industries"
 */
export const IndustrySchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type IndustryRecord = z.infer<typeof IndustrySchema>;
