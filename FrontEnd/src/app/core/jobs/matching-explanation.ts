import { MatchingExplanation } from '../models/api.models';

/** Historical evaluation JSON used PascalCase; current REST DTOs use camelCase. */
export function parseMatchingExplanation(value: unknown): MatchingExplanation | null {
  try {
    const parsed: unknown = typeof value === 'string' ? JSON.parse(value) : value;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return Object.fromEntries(Object.entries(parsed).map(([key, item]) => [key.charAt(0).toLowerCase() + key.slice(1), item])) as MatchingExplanation;
  } catch { return null; }
}
