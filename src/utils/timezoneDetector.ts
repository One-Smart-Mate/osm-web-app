/**
 * Detects the user's timezone with robust fallback mechanisms.
 * Returns a valid IANA timezone format or UTC as fallback.
 * Converts Etc/GMT±X timezones to regional names for better compatibility.
 */
export function detectUserTimezone(): string {
  // Default fallback
  let userTimezone = 'UTC';
  let originalDetected = '';

  try {
    // Try to get timezone from Intl API
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    originalDetected = detectedTimezone || 'undefined';

    console.log('[Timezone Detection] Original detected:', originalDetected);

    if (detectedTimezone && detectedTimezone.includes('/')) {
      // Check if it's an Etc/GMT timezone and convert it to a regional name
      if (detectedTimezone.startsWith('Etc/GMT')) {
        // Parse Etc/GMT offset (note: signs are inverted in Etc/GMT)
        // Etc/GMT+6 means UTC-6, Etc/GMT-6 means UTC+6
        const match = detectedTimezone.match(/Etc\/GMT([+-])?(\d+)/);
        if (match) {
          const sign = match[1] || '+';
          const hours = parseInt(match[2], 10);
          // FIXED: Invert the sign correctly for Etc/GMT
          // Etc/GMT+X means UTC-X (west), so offset in minutes is positive
          // Etc/GMT-X means UTC+X (east), so offset in minutes is negative
          const offset = (sign === '+' ? 1 : -1) * hours * 60;

          console.log(`[Timezone Detection] Converting Etc/GMT${sign}${hours} to offset ${offset} minutes`);
          userTimezone = mapOffsetToTimezone(offset);
        } else if (detectedTimezone === 'Etc/GMT') {
          // Handle Etc/GMT without offset (equivalent to UTC)
          userTimezone = 'UTC';
        } else {
          // If we can't parse it, fall back to offset-based detection
          console.log('[Timezone Detection] Unrecognized Etc/GMT format, using offset detection');
          userTimezone = detectTimezoneByOffset();
        }
      } else {
        // It's a valid regional timezone (e.g., America/Mexico_City)
        userTimezone = detectedTimezone;
      }
    } else {
      // No timezone with slash detected, use offset-based method
      console.log('[Timezone Detection] No slash in timezone, using offset detection');
      userTimezone = detectTimezoneByOffset();
    }
  } catch (timezoneError) {
    console.warn('[Timezone Detection] Error, using UTC as fallback:', timezoneError);
  }

  // Final validation: ensure the timezone matches the backend regex
  const backendRegex = /^([A-Z][a-zA-Z]*\/[A-Za-z_/-]+|UTC|GMT[+-]?\d{1,2}(:\d{2})?)$/;
  if (!backendRegex.test(userTimezone)) {
    console.warn(`[Timezone Detection] Final timezone "${userTimezone}" doesn't match backend regex, falling back to UTC`);
    userTimezone = 'UTC';
  }

  console.log(`[Timezone Detection] Final result: "${originalDetected}" → "${userTimezone}"`);
  return userTimezone;
}

/**
 * Maps a timezone offset (in minutes) to a regional IANA timezone name.
 * @param offset - Timezone offset in minutes (negative = east of UTC, positive = west of UTC)
 *                 This follows JavaScript's Date.getTimezoneOffset() convention
 */
function mapOffsetToTimezone(offset: number): string {
  // Map of offsets to most common regional timezones
  // Using string keys for all offsets to avoid TypeScript issues
  const offsetToTimezone: Record<string, string> = {
    '780': 'Pacific/Kiritimati',      // UTC-13 (far west)
    '720': 'Pacific/Fiji',            // UTC-12
    '660': 'Pacific/Apia',            // UTC-11
    '600': 'Pacific/Honolulu',        // UTC-10 (Hawaii)
    '540': 'America/Anchorage',       // UTC-9 (Alaska)
    '480': 'America/Los_Angeles',     // UTC-8 (PST)
    '420': 'America/Denver',          // UTC-7 (MST)
    '360': 'America/Mexico_City',     // UTC-6 (CST/Mexico)
    '300': 'America/New_York',        // UTC-5 (EST)
    '240': 'America/Santo_Domingo',   // UTC-4 (Caribbean)
    '180': 'America/Sao_Paulo',       // UTC-3 (Brazil)
    '120': 'America/Noronha',         // UTC-2 (Brazil islands)
    '60': 'Atlantic/Azores',          // UTC-1 (Azores)
    '0': 'UTC',                       // UTC±0
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
    '-390': 'Asia/Yangon',          // UTC+6:30 (Myanmar)
    '-420': 'Asia/Bangkok',         // UTC+7 (Thailand)
    '-480': 'Asia/Shanghai',        // UTC+8 (China)
    '-540': 'Asia/Tokyo',           // UTC+9 (Japan)
    '-570': 'Australia/Adelaide',   // UTC+9:30 (Australia Central)
    '-600': 'Australia/Sydney',     // UTC+10 (Australia)
    '-660': 'Pacific/Norfolk',      // UTC+11 (Norfolk Island)
    '-720': 'Pacific/Auckland',     // UTC+12 (New Zealand)
    '-780': 'Pacific/Tongatapu',    // UTC+13 (Tonga)
    '-840': 'Pacific/Kiritimati'    // UTC+14 (Line Islands)
  };

  // Return mapped timezone
  const mappedZone = offsetToTimezone[offset.toString()];
  if (mappedZone) {
    return mappedZone;
  }

  // Build GMT offset string as fallback for unmapped offsets
  // This is guaranteed to be accepted by the backend regex
  const offsetHours = Math.floor(Math.abs(offset) / 60);
  const offsetMinutes = Math.abs(offset) % 60;
  // JavaScript offset convention: positive = west (negative UTC), negative = east (positive UTC)
  const sign = offset > 0 ? '-' : '+';

  if (offsetMinutes === 0) {
    return `GMT${sign}${offsetHours}`;
  } else {
    // Format minutes with leading zero if needed
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