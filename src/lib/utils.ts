import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DateTime } from 'luxon';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if enrollment is still open
 * @param enrollmentEndDate ISO string, e.g. "2025-04-30"
 */
export function checkEnrollmentOpen(enrollmentEndDate: string | null): boolean {
  if (!enrollmentEndDate) return false;

  const currentDate = DateTime.now().setZone("America/New_York");
  const endDate = DateTime.fromISO(enrollmentEndDate, {
    zone: "America/New_York",
  });

  return currentDate.toMillis() < endDate.toMillis();
}

export function convertTimetzTo12HourFormat(timetz: string): string {
  // Match the parts: HH:MM:SS and timezone offset (e.g., -05)
  const match = timetz.match(/^(\d{2}:\d{2}(:\d{2})?)([+-]\d{2})$/);
  if (!match) {
    throw new Error("Invalid timetz format");
  }

  const timePart = match[1];
  const timeZoneOffset = match[3];

  // Extract hours and minutes from the time part
  const [hours, minutes, seconds] = timePart.split(':').map(Number);

  // Calculate the UTC time by applying the timezone offset to the input time
  const utcDate = new Date(Date.UTC(1970, 0, 1, hours - Number(timeZoneOffset), minutes, seconds));

  // Format the date into a 12-hour time format
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(utcDate);
}

export function getWeekdayName(date: string): string {
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const day = new Date(date).getDay();
  return dayNames[day];
}

export function getMondayAndFridayOfThisWeek(): { monday: string, friday: string } {
  const currentDate = new Date();
  const currentDay = currentDate.getDay();

  // Get Monday (first day of the current week)
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

  // Get Friday (fifth day of the current week)
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  return {
    monday: monday.toDateString(),
    friday: friday.toDateString()
  };
}
