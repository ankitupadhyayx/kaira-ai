import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise DepartmentSchema definition for domain: "departments"
 */
export const DepartmentSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type DepartmentRecord = z.infer<typeof DepartmentSchema>;
