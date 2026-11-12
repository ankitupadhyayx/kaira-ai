import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise CaseStudySchema definition for domain: "case-studies"
 */
export const CaseStudySchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type CaseStudyRecord = z.infer<typeof CaseStudySchema>;
