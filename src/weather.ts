import { weatherConfig } from './config';
import { getWeatherImage, getWeatherDescription, getWorstWeatherCode, getUmbrellaIcon } from './weather-codes'
import { updateOutfitOptions } from './outfit'

export const morningBlockName: string = "Morning"
export const afternoonBlockName: string = "Afternoon"
export const eveningBlockName: string = "Evening"

export let chanceOfRainPerc: number = 0
export let isUmbrellaNeeded: boolean = false
export let rainTotalExpected: number = 0
export let minTemperature: number = 100

let city: String;
let cityLatLong: CityLatLong;

interface CityLatLong {
    latitude: number;
    longitude: number;
}

interface TemperatureBlock {
    blockName: string;
    blockStartHour: number; // 24hr clock notation
    blockEndHour: number; // 24hr clock notation
    tempFeelsLikeMin: number;
    tempFeelsLikeMax: number;
    precepitationPercHighest: number;
    totalRainfall: number;
    totalSnowfall: number;
    weatherCode: number;
    pastData: boolean;
}

function getHours(blockName: string): number[] {
    switch (blockName) {
        case morningBlockName:
            return weatherConfig.blockMorningHours
        case afternoonBlockName:
            return weatherConfig.blockAfternoonHours
        case eveningBlockName:
            return weatherConfig.blockEveningHours
        default:
            return []
    }
}

function getWeatherElementForHours(hourly_weather_element: any, hours: number[], usePreviousHours: boolean): number[] {
    const weatherByHour = []
    for (const hour of hours) {
        const hourToUse = usePreviousHours ? hour-1 : hour
        if (hourToUse < 0 || hourToUse > 23)
            continue;
        weatherByHour.push(hourly_weather_element[hourToUse])
    }
    return weatherByHour;
}

function sumArray(numbers: number[]): number {
    return numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}

function removePastHours(numbers: number[], current_hour: number): number[] {
    return numbers.filter(number => number >= current_hour);
}

function getTemperatureBlock(blockName: string, hourly_weather_data: any, current_hour: number): TemperatureBlock {
    let hours = getHours(blockName);

    // remove past hours
    if (weatherConfig.removePastBlocks) {
        hours = removePastHours(hours, current_hour)
    }

    // assume we always have a 24hrs array of numbers in the hourly_weather_data, therefore indices match hours
    // a bunch of the weather elements are for previous hour
    const tempFeelsLikeByHour: number[] = getWeatherElementForHours(hourly_weather_data.apparent_temperature, hours, false)
    const precepitationPercByHour: number[] = getWeatherElementForHours(hourly_weather_data.precipitation_probability, hours, true)
    const rainfallByHour: number[] = getWeatherElementForHours(hourly_weather_data.rain, hours, true)
    const snowfallByHour: number[] = getWeatherElementForHours(hourly_weather_data.snowfall, hours, true)
    const weatherCodeByHour: number[] = getWeatherElementForHours(hourly_weather_data.weathercode, hours, false)

    const lastHour: number = hours.length === 0 ? 0 : hours[hours.length-1]

    return {
        blockName: blockName,
        blockStartHour: hours.length === 0 ? 0 : hours[0], // 24hr clock notation
        blockEndHour: lastHour, // 24hr clock notation
        tempFeelsLikeMin: tempFeelsLikeByHour.length === 0 ? 0 : Math.round(Math.min(...tempFeelsLikeByHour)),
        tempFeelsLikeMax: tempFeelsLikeByHour.length === 0 ? 0 : Math.round(Math.max(...tempFeelsLikeByHour)),
        precepitationPercHighest: precepitationPercByHour.length === 0 ? 0 : Math.max(...precepitationPercByHour),
        totalRainfall: sumArray(rainfallByHour),
        totalSnowfall: sumArray(snowfallByHour),
        weatherCode: getWorstWeatherCode(weatherCodeByHour),
        pastData: current_hour > lastHour
    }
}

function getCurrentChanceOfRain(percentageChance: number, now: boolean): string {
    if (now) {
        if (percentageChance === 0 )
            return "No Rain";
        if (percentageChance < 40 )
            return `Rain unlikely`;
        if (percentageChance < 60 )
            return `Rain likely`;
        if (percentageChance < 90 )
            return `Rain v likely`;
        else
            return `Will rain`;
    } else {
        if (percentageChance === 0 )
            return "No Rain expected";
        else {
            return `${percentageChance}% chance of rain`;
        }
    }
}

function getRainAmount(totalRain: number ): string {
    return (totalRain > 0) ? `${Math.round(totalRain)}mm` : "";
}

function setElementBlock(id: string, data: any) {
    const currentElement = document.getElementById(id);
    if (currentElement) {
        currentElement.textContent = data;
    }
}

function hideBlock(id: string) {
    const currentElement = document.getElementById(id);
    if (currentElement) {
        currentElement.style.display = "none";
    }
}

function updateGlobalRainDetails(block: TemperatureBlock) {
    if (block.precepitationPercHighest > 50) {
        isUmbrellaNeeded = true
        rainTotalExpected += block.totalRainfall
    }
    if(chanceOfRainPerc < block.precepitationPercHighest) {
        chanceOfRainPerc = block.precepitationPercHighest
    }

    if (minTemperature > block.tempFeelsLikeMin) {
        minTemperature = block.tempFeelsLikeMin
    }
}

function updateBlock(blockName: string, elementName: string, boxName: string, iconName: string, currentHour: number, response: any) {
    const block = getTemperatureBlock(blockName, response.hourly, currentHour);

    if (weatherConfig.removePastBlocks && block.pastData) {
        hideBlock(boxName);
        hideBlock(iconName);
    } else {
        updateGlobalRainDetails(block)

        const tempMinFeelsLikeString = `${block.tempFeelsLikeMin}°C`
        const tempMaxFeelsLikeString = `${block.tempFeelsLikeMax}°C`
        const conditionsString = `${getWeatherDescription(block.weatherCode)}`;
        const percString = `${getCurrentChanceOfRain(block.precepitationPercHighest, false)}`;

        setElementBlock(elementName + "Title", `${block.blockName}`);
        (document.getElementById(iconName) as HTMLImageElement).src = getWeatherImage(block.weatherCode);
        setElementBlock(elementName + "TempMinFeelsLike", `${tempMinFeelsLikeString}`);
        setElementBlock(elementName + "TempMaxFeelsLike", `${tempMaxFeelsLikeString}`);
        setElementBlock(elementName + "CurrentConditions", `${conditionsString}`);
        setElementBlock(elementName + "CurrentRain", `${percString}`);
    }
}

function updateCurrentBlock(response: any, weatherCode: number) {
    setElementBlock("currentTemperatureFeelsLike", `${Math.round(response.current.apparent_temperature)} °C`);
    setElementBlock("currentConditions", getWeatherDescription(weatherCode));
    (document.getElementById('currentWeatherIcon') as HTMLImageElement).src = getWeatherImage(weatherCode);
}

function updateDayBlocks(response: any, currentHour: number) {
    updateBlock(morningBlockName, "blockMorning", "morning_box", 'morningWeatherIcon', currentHour, response)
    updateBlock(afternoonBlockName, "blockAfternoon", "afternoon_box", 'afternoonWeatherIcon', currentHour, response)
    updateBlock(eveningBlockName, "blockEvening", "evening_box", 'eveningWeatherIcon', currentHour, response)
}

function updateChanceOfRainBlock() {
    const chanceOfRainStr = `${chanceOfRainPerc}%`
    setElementBlock("carryUmbrealla", `${chanceOfRainStr}`)
    const umbrellaIcon: string = "umbrellaIcon";
    (document.getElementById(umbrellaIcon) as HTMLImageElement).src = getUmbrellaIcon(chanceOfRainPerc);
}

function updatePage(pageResponse: string) {
    const response = JSON.parse(pageResponse);
    console.log(response);

    const currentHour: number = new Date().getHours();
    const weatherCode: number = response.current.weather_code;

    updateCurrentBlock(response, weatherCode);
    updateDayBlocks(response, currentHour);

    updateChanceOfRainBlock();
    setElementBlock("currentHour", currentHour)
    setElementBlock("todayRain", getCurrentChanceOfRain(chanceOfRainPerc, true));
    setElementBlock("todayRainAmount", getRainAmount(rainTotalExpected));

    updateOutfitOptions(minTemperature, chanceOfRainPerc);
}

function getLatLong(): CityLatLong {
    let latitude: number;
    let longitude: number;
    switch(city) {
        case 'Furano': {
            latitude = 43.3250;
            longitude = 142.3532;
            break;
        }
        case 'Niseko': {
            latitude = 42.8;
            longitude = 140.683333;
            break;
        }
        case 'Osaka': {
            latitude = 34.733483;
            longitude = 135.500114;
            break;
        }
        case 'Kobe': {
            latitude = 34.69;
            longitude = 135.195556;
            break;
        }
        default: {
            // tokyo
            latitude = 35.6587;
            longitude = 139.7765;
        }
    }
    return {
        latitude: latitude,
        longitude: longitude
    }
}


const WEATHER_TIMEOUT_MS = 15000; // give up on a request that hangs (open-meteo sometimes stops answering)
const REFRESH_INTERVAL_MS = 600000; // 10 mins between updates when the last one worked
const RETRY_INTERVAL_MS = 60000; // 1 min between retries after a failure
const CACHE_KEY_PREFIX = "weatherCache:";

interface CachedWeather {
    savedAt: string; // ISO time the forecast was fetched
    body: string; // the raw open-meteo response
}

let lastAttemptTime: Date = new Date(0);
let lastAttemptOk: boolean = false;
let requestInFlight: boolean = false;
let shownForecastDate: string | null = null; // YYYY-MM-DD of the forecast on screen

class WeatherFetchError extends Error {}

function todayDateString(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
}

function forecastDate(body: string): string {
    // current.time is local to the requested timezone, e.g. "2026-11-15T15:00"
    return String(JSON.parse(body).current.time).slice(0, 10);
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function showWeatherError(message: string | null) {
    const errorElement = document.getElementById("weatherError");
    if (!errorElement) {
        return;
    }
    errorElement.textContent = message ?? "";
    errorElement.hidden = message === null;
}

function saveToCache(body: string, savedAt: Date) {
    try {
        const cached: CachedWeather = { savedAt: savedAt.toISOString(), body: body };
        localStorage.setItem(CACHE_KEY_PREFIX + city, JSON.stringify(cached));
    } catch {
        // storage full or disabled (private browsing): carry on without a cache
    }
}

// The last good forecast for this city, but only if it is for today: an old day's forecast is worse than none.
function loadTodaysCache(): CachedWeather | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY_PREFIX + city);
        if (!raw) {
            return null;
        }
        const cached: CachedWeather = JSON.parse(raw);
        return forecastDate(cached.body) === todayDateString() ? cached : null;
    } catch {
        return null;
    }
}

function renderForecast(body: string, updatedAt: Date) {
    updatePage(body);
    shownForecastDate = forecastDate(body);
    setElementBlock("weatherLastUpdated", updatedAt);
}

async function fetchWeather(url: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), WEATHER_TIMEOUT_MS);
    let response: Response;
    try {
        response = await fetch(url, { signal: controller.signal });
    } catch (error) {
        if (controller.signal.aborted) {
            throw new WeatherFetchError(`no response after ${WEATHER_TIMEOUT_MS / 1000}s (timed out)`);
        }
        throw new WeatherFetchError(`network error (${error instanceof Error ? error.message : error})`);
    } finally {
        clearTimeout(timer);
    }

    const body = await response.text();
    if (!response.ok) {
        // open-meteo explains errors as {"error": true, "reason": "..."}
        let reason = response.statusText;
        try {
            reason = JSON.parse(body).reason || reason;
        } catch {
            // not JSON: keep the status text
        }
        throw new WeatherFetchError(`HTTP ${response.status}${reason ? `: ${reason}` : ""}`);
    }
    return body;
}

async function getWeatherData() {
    if (requestInFlight) {
        return;
    }
    requestInFlight = true;
    lastAttemptTime = new Date();

    const url = "https://api.open-meteo.com/v1/forecast?" +
        "latitude=" + cityLatLong.latitude +
        "&longitude=" + cityLatLong.longitude +
        "&timezone=Asia%2FTokyo" +
        "&current=temperature_2m,apparent_temperature,is_day,precipitation,precipitation_probability,rain,showers,snowfall,weather_code" +
        "&forecast_days=1" +
        "&hourly=temperature_2m,weathercode,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth";

    try {
        const body = await fetchWeather(url);
        try {
            renderForecast(body, lastAttemptTime);
        } catch (error) {
            throw new WeatherFetchError(`unexpected response (${error instanceof Error ? error.message : error})`);
        }
        saveToCache(body, lastAttemptTime);
        lastAttemptOk = true;
        showWeatherError(null);
    } catch (error) {
        lastAttemptOk = false;
        const reason = error instanceof WeatherFetchError ? error.message : String(error);
        console.log(`Failed to fetch weather data: ${reason}`);
        handleFailure(reason);
    } finally {
        requestInFlight = false;
    }
}

function handleFailure(reason: string) {
    const today = todayDateString();
    let note = `retrying every ${RETRY_INTERVAL_MS / 60000} min`;

    if (shownForecastDate !== today) {
        const cached = loadTodaysCache();
        if (cached) {
            try {
                renderForecast(cached.body, new Date(cached.savedAt));
                note = `showing the forecast saved at ${formatTime(new Date(cached.savedAt))}; ${note}`;
            } catch {
                // a cache we cannot render is no use
            }
        } else if (shownForecastDate !== null) {
            // yesterday's forecast is still on screen and nothing newer is available: start afresh rather than show it
            window.location.reload();
            return;
        }
    }

    showWeatherError(`Weather update failed at ${formatTime(lastAttemptTime)}: ${reason} (${note})`);
}

function checkIfWeatherNeedsAnUpdate() {
    // if not updated for 10mins (or 1min after a failure), update
    const interval = lastAttemptOk ? REFRESH_INTERVAL_MS : RETRY_INTERVAL_MS;
    if ((new Date().getTime() - lastAttemptTime.getTime()) > interval) {
        getWeatherData();
    }
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function getCityFromUrlParams()   {
    const urlParams = new URLSearchParams(window.location.search);
    const urlParamsReturned = urlParams.get("city") || 'tokyo';
    console.log(urlParamsReturned);
    city = capitalize(urlParamsReturned);
    cityLatLong = getLatLong();
    setElementBlock("city", city)
}

const refreshButton = document.getElementById('refreshButton');

if (refreshButton) {
    refreshButton.addEventListener('click', (): void => {
        window.location.reload();
    });
}

getCityFromUrlParams();
getWeatherData();
setInterval(checkIfWeatherNeedsAnUpdate, 5000); // refresh every 5 seconds (5000)