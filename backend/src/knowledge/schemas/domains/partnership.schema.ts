import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise PartnershipSchema definition for domain: "partnerships"
 */
export const PartnershipSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type PartnershipRecord = z.infer<typeof PartnershipSchema>;
