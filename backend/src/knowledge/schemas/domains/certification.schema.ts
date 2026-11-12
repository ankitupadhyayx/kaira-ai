import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise CertificationSchema definition for domain: "certifications"
 */
export const CertificationSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type CertificationRecord = z.infer<typeof CertificationSchema>;
