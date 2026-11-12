import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise BlogSchema definition for domain: "blogs"
 */
export const BlogSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type BlogRecord = z.infer<typeof BlogSchema>;
