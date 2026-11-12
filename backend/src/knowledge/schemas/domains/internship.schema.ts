import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise InternshipSchema definition for domain: "internship"
 */
export const InternshipSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type InternshipRecord = z.infer<typeof InternshipSchema>;
