import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise LocationSchema definition for domain: "locations"
 */
export const LocationSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type LocationRecord = z.infer<typeof LocationSchema>;
