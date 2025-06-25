import dayjs from "dayjs";

/**
 * Formats seconds into a natural time format (HH:MM:SS or MM:SS)
 * @param seconds - The number of seconds to format
 * @returns Formatted time string
 */
export const formatSecondsToNaturalTime = (seconds: number | null | undefined): string => {
  if (seconds === null || seconds === undefined) return 'N/A';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

/**
 * Parses a natural time format (HH:MM:SS or MM:SS) into seconds
 * @param timeString - The time string to parse
 * @returns Total seconds
 */
export const parseNaturalTimeToSeconds = (timeString: string): number | null => {
  if (!timeString) return null;
  
  // Handle direct seconds input
  if (/^\d+$/.test(timeString)) {
    return parseInt(timeString, 10);
  }
  
  const parts = timeString.split(':').map(part => parseInt(part, 10));
  
  if (parts.some(isNaN)) return null;
  
  if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  }
  
  return null;
};

/**
 * Gets the week number for a given date
 * @param date - The dayjs date object
 * @returns Week number (1-based)
 */
export const getWeekNumber = (date: dayjs.Dayjs): number => {
  const startOfYear = date.startOf('year');
  const diff = date.diff(startOfYear, 'week');
  return diff + 1;
};
