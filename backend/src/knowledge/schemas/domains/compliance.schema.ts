import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise ComplianceSchema definition for domain: "compliance"
 */
export const ComplianceSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type ComplianceRecord = z.infer<typeof ComplianceSchema>;
