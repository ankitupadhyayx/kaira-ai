import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise ServiceSchema definition for domain: "services"
 */
export const ServiceSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type ServiceRecord = z.infer<typeof ServiceSchema>;
