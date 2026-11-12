import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise TechnologySchema definition for domain: "technologies"
 */
export const TechnologySchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type TechnologyRecord = z.infer<typeof TechnologySchema>;
