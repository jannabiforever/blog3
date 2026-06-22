/**
 * Date formatting helpers. All inputs are ISO strings ("YYYY-MM-DD"),
 * parsed by hand to avoid timezone drift from `new Date()`.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-06-14" → "Jun 14" (list / archive meta). */
export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${Number(d)}`;
}

/** "2026-06-14" → "2026 · 06 · 14" (byline meta). */
export function dottedDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y} · ${m} · ${d}`;
}

/** "2026-06-14" → "2026". */
export function year(iso: string): string {
  return iso.split("-")[0];
}
