// TYPES //
export interface WeatherData {
  city: string;
  temperatureC: number;
}

/** How long a reading is reused before another is fetched. */
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Cached reading, shared by every request this server handles.
 *
 * The masthead shows the newsroom's own weather, the way a printed paper does.
 * That is deliberate: asking each reader for their location would be the only
 * tracking-shaped thing on the page, and the footer promises otherwise.
 */
let cached: { value: WeatherData; fetchedAt: number } | null = null;

/**
 * Fetches the current temperature for the configured newsroom city.
 *
 * Open-Meteo needs no API key. Returns null on any failure so the masthead
 * simply omits the reading rather than breaking the page.
 *
 * @returns Current weather, or null when unavailable
 */
export async function getWeatherRequest(): Promise<WeatherData | null> {
  const city = import.meta.env.PUBLIC_WEATHER_CITY ?? 'Mumbai';
  const latitude = import.meta.env.PUBLIC_WEATHER_LAT ?? '19.0760';
  const longitude = import.meta.env.PUBLIC_WEATHER_LON ?? '72.8777';

  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.value;
  }

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`,
      { signal: AbortSignal.timeout(3000) },
    );

    if (!response.ok) {
      return cached?.value ?? null;
    }

    const payload = (await response.json()) as { current?: { temperature_2m?: number } };
    const temperature = payload.current?.temperature_2m;

    if (typeof temperature !== 'number') {
      return cached?.value ?? null;
    }

    const value: WeatherData = { city, temperatureC: Math.round(temperature) };
    cached = { value, fetchedAt: Date.now() };

    return value;
  } catch {
    // Network failure or timeout - keep the last good reading if there is one.
    return cached?.value ?? null;
  }
}
