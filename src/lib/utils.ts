import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertTimetzTo12HourFormat(timetz: string): string {
  // Match the parts: HH:MM:SS, optional seconds, and timezone offset
  const match = timetz.match(/^(\d{2}:\d{2}(:\d{2})?)([+-]\d{2})?$/);
  if (!match) {
    throw new Error("Invalid timetz format");
  }

  const timePart = match[1];  // "13:00:00"
  const timeZonePart = match[3] ? `${match[3]}:00` : 'Z';  // Convert "-04" to "-04:00" or default to UTC
  const today = new Date().toISOString().split('T')[0];  // Use today's date to avoid DST issues
  const isoDateTime = `${today}T${timePart}${timeZonePart}`;
  const date = new Date(isoDateTime);

  // Format in local time, 12-hour format
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
}

