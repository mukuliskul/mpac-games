import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
