/**
 * Shared formatting utilities used across multiple pages.
 */

/**
 * Format a YYYY-MM-DD date string into a human-readable format.
 * @example formatDisplayDate("2026-03-15") => "Mar 15, 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Format a YYYY-MM-DD date string into "Month Day" format (no year).
 * @example formatMonthDay("2026-03-15") => "March 15"
 */
export function formatMonthDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}
