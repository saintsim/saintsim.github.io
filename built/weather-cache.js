// Pure helpers for fetching and caching the open-meteo forecast: no DOM or storage access,
// so they can be unit-tested (scripts/weather-cache.test.mjs imports the compiled built/weather-cache.js).
// Every city on the page is in Japan, so the forecast is requested in, and dated by, Tokyo time.
export const FORECAST_TIME_ZONE = "Asia/Tokyo";
// The fields updatePage reads; anything missing would leave a half-drawn page.
const REQUIRED_CURRENT_FIELDS = ["time", "weather_code", "apparent_temperature"];
const REQUIRED_HOURLY_FIELDS = ["apparent_temperature", "precipitation_probability", "rain", "snowfall", "weathercode"];
// Today's date (YYYY-MM-DD) in the given time zone; en-CA formats dates as YYYY-MM-DD.
export function todayInZone(now, timeZone = FORECAST_TIME_ZONE) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timeZone }).format(now);
}
// Parses an open-meteo response, throwing if it lacks a field the page needs.
export function parseForecast(body) {
    const forecast = JSON.parse(body);
    const missing = [
        ...REQUIRED_CURRENT_FIELDS.filter(field => forecast?.current?.[field] === undefined).map(field => `current.${field}`),
        ...REQUIRED_HOURLY_FIELDS.filter(field => !Array.isArray(forecast?.hourly?.[field])).map(field => `hourly.${field}`),
    ];
    if (missing.length > 0) {
        throw new Error(`missing ${missing.join(", ")}`);
    }
    return forecast;
}
// The forecast's date (YYYY-MM-DD): current.time is local to the requested time zone, e.g. "2026-11-15T15:00".
export function forecastDate(forecast) {
    return String(forecast.current.time).slice(0, 10);
}
// The cached forecast if it is usable and for `today`, else null: an old day's forecast is worse than none.
export function usableCache(raw, today) {
    if (!raw) {
        return null;
    }
    try {
        const cached = JSON.parse(raw);
        if (typeof cached.savedAt !== "string" || isNaN(new Date(cached.savedAt).getTime())) {
            return null;
        }
        return forecastDate(parseForecast(cached.body)) === today ? cached : null;
    }
    catch {
        return null;
    }
}
// "HTTP 429: <reason>", using open-meteo's {"error": true, "reason": "..."} body when there is one.
export function describeHttpError(status, statusText, body) {
    let reason = statusText;
    try {
        reason = JSON.parse(body).reason || reason;
    }
    catch {
        // not JSON: keep the status text
    }
    return `HTTP ${status}${reason ? `: ${reason}` : ""}`;
}
