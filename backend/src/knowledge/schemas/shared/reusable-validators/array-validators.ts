import { z } from 'zod';

/**
 * Validates that an array contains unique items (case-insensitive string uniqueness).
 */
export const UniqueStringArray = z
  .array(z.string())
  .refine((items) => {
    const normalized = items.map((i) => i.trim().toLowerCase());
    return new Set(normalized).size === normalized.length;
  }, { message: 'Array items must be unique (duplicate entries detected)' })
  .default([]);
