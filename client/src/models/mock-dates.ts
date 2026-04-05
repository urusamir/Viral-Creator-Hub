/**
 * Utility to generate dates relative to today.
 * This ensures mock/preview data always looks current,
 * no matter when the app is opened.
 */

/** Returns a YYYY-MM-DD string for (today + offsetDays). Negative = past. */
export function relativeDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/** Returns a full ISO timestamp for (today + offsetDays). */
export function relativeISO(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
}
