/**
 * Detects the user's timezone with robust fallback mechanisms.
 * Returns a valid IANA timezone format or UTC as fallback.
 * Converts Etc/GMT±X timezones to regional names for better compatibility.
 */
export function detectUserTimezone(): string {
  // Default fallback
  let userTimezone = 'UTC';

  try {
    // Try to get timezone from Intl API
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (detectedTimezone && detectedTimezone.includes('/')) {
      // Check if it's an Etc/GMT timezone and convert it to a regional name
      if (detectedTimezone.startsWith('Etc/GMT')) {
        // Parse Etc/GMT offset (note: signs are inverted in Etc/GMT)
        // Etc/GMT+6 means UTC-6, Etc/GMT-6 means UTC+6
        const match = detectedTimezone.match(/Etc\/GMT([+-])?(\d+)/);
        if (match) {
          const sign = match[1] || '+';
          const hours = parseInt(match[2], 10);
          // Invert the sign for JavaScript offset (positive means west of UTC)
          const offset = (sign === '+' ? 1 : -1) * hours * 60;

          userTimezone = mapOffsetToTimezone(offset);
        } else {
          // If we can't parse it, fall back to offset-based detection
          userTimezone = detectTimezoneByOffset();
        }
      } else {
        // It's a valid regional timezone (e.g., America/Mexico_City)
        userTimezone = detectedTimezone;
      }
    } else {
      // No timezone with slash detected, use offset-based method
      userTimezone = detectTimezoneByOffset();
    }
  } catch (timezoneError) {
    console.warn('Could not detect timezone, using UTC as fallback:', timezoneError);
  }

  return userTimezone;
}

/**
 * Maps a timezone offset (in minutes) to a regional IANA timezone name.
 * @param offset - Timezone offset in minutes (positive = west of UTC)
 */
function mapOffsetToTimezone(offset: number): string {
  // Map of offsets to most common regional timezones
  const offsetToTimezone: Record<number, string> = {
    600: 'Pacific/Honolulu',        // UTC-10 (Hawaii)
    540: 'America/Anchorage',       // UTC-9 (Alaska)
    480: 'America/Los_Angeles',     // UTC-8 (PST)
    420: 'America/Denver',          // UTC-7 (MST)
    360: 'America/Mexico_City',     // UTC-6 (CST/Mexico)
    300: 'America/New_York',        // UTC-5 (EST)
    240: 'America/Santo_Domingo',   // UTC-4 (Caribbean)
    180: 'America/Sao_Paulo',       // UTC-3 (Brazil)
    0: 'UTC',                       // UTC±0
    '-60': 'Europe/Berlin',         // UTC+1 (CET)
    '-120': 'Europe/Athens',        // UTC+2 (EET)
    '-180': 'Europe/Moscow',        // UTC+3 (Russia)
    '-210': 'Asia/Tehran',          // UTC+3:30 (Iran)
    '-240': 'Asia/Dubai',           // UTC+4 (UAE)
    '-270': 'Asia/Kabul',           // UTC+4:30 (Afghanistan)
    '-300': 'Asia/Karachi',         // UTC+5 (Pakistan)
    '-330': 'Asia/Kolkata',         // UTC+5:30 (India)
    '-345': 'Asia/Kathmandu',       // UTC+5:45 (Nepal)
    '-360': 'Asia/Dhaka',           // UTC+6 (Bangladesh)
    '-420': 'Asia/Bangkok',         // UTC+7 (Thailand)
    '-480': 'Asia/Shanghai',        // UTC+8 (China)
    '-540': 'Asia/Tokyo',           // UTC+9 (Japan)
    '-600': 'Australia/Sydney',     // UTC+10 (Australia)
    '-630': 'Australia/Adelaide',   // UTC+10:30 (Australia Central)
    '-660': 'Pacific/Auckland',     // UTC+11 (New Zealand)
    '-720': 'Pacific/Fiji',         // UTC+12 (Fiji)
  };

  // Return mapped timezone or build GMT offset string as fallback
  if (offsetToTimezone[offset]) {
    return offsetToTimezone[offset];
  }

  // Build GMT offset string for unmapped offsets
  const offsetHours = Math.floor(Math.abs(offset) / 60);
  const offsetMinutes = Math.abs(offset) % 60;
  const sign = offset <= 0 ? '+' : '-';

  if (offsetMinutes === 0) {
    return `GMT${sign}${offsetHours}`;
  } else {
    return `GMT${sign}${offsetHours}:${offsetMinutes.toString().padStart(2, '0')}`;
  }
}

/**
 * Detects timezone by calculating the browser's current offset.
 */
function detectTimezoneByOffset(): string {
  const offset = new Date().getTimezoneOffset();
  return mapOffsetToTimezone(offset);
}