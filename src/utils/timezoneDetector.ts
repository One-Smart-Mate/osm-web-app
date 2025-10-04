/**
 * Detects the user's timezone with robust fallback mechanisms.
 * Returns a valid IANA timezone format or UTC as fallback.
 */
export function detectUserTimezone(): string {
  // Default fallback
  let userTimezone = 'UTC';

  try {
    // Try to get timezone from Intl API
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (detectedTimezone && detectedTimezone.includes('/')) {
      // Validate it's a valid IANA timezone (contains a slash)
      userTimezone = detectedTimezone;
    } else {
      // Try alternative method using Date offset
      const offset = new Date().getTimezoneOffset();
      const offsetHours = Math.floor(Math.abs(offset) / 60);
      const offsetMinutes = Math.abs(offset) % 60;
      const sign = offset <= 0 ? '+' : '-';

      // Create a GMT offset timezone as fallback
      const gmtOffset = `GMT${sign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;

      // Try to map common offsets to IANA timezones
      // Note: We use the most common timezone for each offset
      const offsetToTimezone: { [key: number]: string } = {
        600: 'Pacific/Honolulu',        // GMT-10 (Hawaii)
        540: 'America/Anchorage',       // GMT-9 (Alaska)
        480: 'America/Los_Angeles',     // GMT-8 (PST)
        420: 'America/Denver',          // GMT-7 (MST/PDT)
        360: 'America/Mexico_City',     // GMT-6 (CST/Mexico)
        300: 'America/New_York',        // GMT-5 (EST)
        240: 'America/Santo_Domingo',   // GMT-4 (EDT/Caribbean)
        180: 'America/Sao_Paulo',       // GMT-3 (Brazil)
        0: 'UTC',                       // GMT+0
        '-60': 'Europe/Berlin',         // GMT+1 (CET)
        '-120': 'Europe/Athens',        // GMT+2 (EET)
        '-180': 'Europe/Moscow',        // GMT+3 (Russia)
        '-210': 'Asia/Tehran',          // GMT+3:30 (Iran)
        '-240': 'Asia/Dubai',           // GMT+4 (UAE)
        '-270': 'Asia/Kabul',           // GMT+4:30 (Afghanistan)
        '-300': 'Asia/Karachi',         // GMT+5 (Pakistan)
        '-330': 'Asia/Kolkata',         // GMT+5:30 (India)
        '-345': 'Asia/Kathmandu',       // GMT+5:45 (Nepal)
        '-360': 'Asia/Dhaka',           // GMT+6 (Bangladesh)
        '-420': 'Asia/Bangkok',         // GMT+7 (Thailand)
        '-480': 'Asia/Shanghai',        // GMT+8 (China/Singapore)
        '-540': 'Asia/Tokyo',           // GMT+9 (Japan/Korea)
        '-600': 'Australia/Sydney',     // GMT+10 (Australia Eastern)
        '-630': 'Australia/Adelaide',   // GMT+10:30 (Australia Central)
        '-660': 'Pacific/Auckland',     // GMT+11 (New Zealand)
        '-720': 'Pacific/Fiji',         // GMT+12 (Fiji)
      };

      // Use mapped timezone if available, otherwise use GMT offset
      userTimezone = offsetToTimezone[offset] || gmtOffset;

      // If we have a GMT offset, try to use it directly if the backend accepts it
      // Otherwise, fallback to UTC
      if (!offsetToTimezone[offset] && gmtOffset.startsWith('GMT')) {
        // Some backends accept GMT offsets, but if not supported, use UTC
        userTimezone = 'UTC';
        console.warn(`Using UTC as fallback. Original offset was ${gmtOffset}`);
      }
    }
  } catch (timezoneError) {
    console.warn('Could not detect timezone, using UTC as fallback:', timezoneError);
  }

  return userTimezone;
}