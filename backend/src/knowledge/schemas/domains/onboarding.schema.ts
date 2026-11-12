import { z } from "zod";
import { BaseKnowledgeSchema } from "../base/base-knowledge.schema";

/**
 * Enterprise OnboardingSchema definition for domain: "onboarding"
 */
export const OnboardingSchema = BaseKnowledgeSchema.extend({
  domain_attributes: z.record(z.unknown()).optional().default({}),
});

export type OnboardingRecord = z.infer<typeof OnboardingSchema>;
