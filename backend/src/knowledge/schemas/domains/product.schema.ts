import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise ProductSchema definition for domain: "products"
 */
export const ProductSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type ProductRecord = z.infer<typeof ProductSchema>;
