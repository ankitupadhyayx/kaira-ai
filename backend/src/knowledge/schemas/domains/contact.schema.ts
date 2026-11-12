import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise ContactSchema definition for domain: "contact"
 */
export const ContactSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type ContactRecord = z.infer<typeof ContactSchema>;
