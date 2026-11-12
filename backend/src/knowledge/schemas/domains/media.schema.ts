import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise MediaSchema definition for domain: "media"
 */
export const MediaSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type MediaRecord = z.infer<typeof MediaSchema>;
