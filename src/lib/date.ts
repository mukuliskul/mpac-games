import { DateTime } from 'luxon';

/**
 * Converts a Date or DateTime to 'yyyy-MM-dd' string in America/New_York timezone (EST/EDT).
 */
export function formatToNYDateString(date: Date | DateTime): string {
  const dt = DateTime.isDateTime(date) ? date : DateTime.fromJSDate(date, { zone: 'America/New_York' });
  return dt.setZone('America/New_York').toFormat('yyyy-MM-dd');
}

/**
 * Parses a date string into a Luxon DateTime in America/New_York timezone (EST/EDT).
 */
export function parseNYDateString(dateStr: string): DateTime {
  return DateTime.fromISO(dateStr, { zone: 'America/New_York' });
}

/**
 * Returns the current DateTime in America/New_York timezone (EST/EDT).
 */
export function getCurrentNYDateTime(): DateTime {
  return DateTime.now().setZone("America/New_York");
}

/**
 * Returns the current date (YYYY-MM-DD) in America/New_York timezone.
 */
export function getCurrentNYDateString(): string {
  return DateTime.now().setZone("America/New_York").toISODate()!;
}
