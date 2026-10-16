import { TimelineEvent } from '../types/character';

/**
 * Extracts a numeric value from year string for chronological sorting.
 * Handles strings like:
 * - "2024", "1998"
 * - "前300年", "公元前500年", "B.C. 200" -> negative numbers
 * - "星陨纪元 342年" -> 342
 * - "新历 50年" -> 50
 */
export function extractYearNumber(yearStr: string): number {
  if (!yearStr) return 0;
  const isBCE = /(前|B\.?C\.?|bc)/i.test(yearStr);
  const match = yearStr.match(/(\d+)/);
  if (match) {
    const val = parseInt(match[1], 10);
    return isBCE ? -val : val;
  }
  return 0;
}

export function sortTimelineEvents(events: TimelineEvent[]): TimelineEvent[] {
  if (!events || !Array.isArray(events)) return [];
  return [...events].sort((a, b) => {
    const numA = extractYearNumber(a.year);
    const numB = extractYearNumber(b.year);
    if (numA !== numB) {
      return numA - numB;
    }
    return (a.year || '').localeCompare(b.year || '');
  });
}
