import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise CompanySchema definition for domain: "company"
 */
export const CompanySchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type CompanyRecord = z.infer<typeof CompanySchema>;
