import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise TrainingSchema definition for domain: "training"
 */
export const TrainingSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type TrainingRecord = z.infer<typeof TrainingSchema>;
