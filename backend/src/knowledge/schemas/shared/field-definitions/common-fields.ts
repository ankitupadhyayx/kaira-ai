import { z } from 'zod';

export const IdField = z.string().min(1, 'ID must be non-empty');
export const SlugField = z.string().min(1, 'Slug must be non-empty').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens');
export const IsoDateTimeField = z.string().datetime({ message: 'Must be a valid ISO 8601 timestamp' }).default(() => new Date().toISOString());
export const UrlField = z.string().url('Must be a valid URL');
export const ConfidenceField = z.number().min(0).max(1).default(1.0);
export const PriorityField = z.number().int().min(1).max(4).default(2);
