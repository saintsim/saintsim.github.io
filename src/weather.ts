import { weatherConfig } from './config';
import { getWeatherImage, getWeatherDescription, getWorstWeatherCode, getUmbrellaIcon } from './weather-codes'
import { updateOutfitOptions, resetOutfitOptions } from './outfit'
import { FORECAST_TIME_ZONE, CachedWeather, todayInZone, parseForecast, forecastDate, usableCache, describeHttpError } from './weather-cache'

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

// Draws a forecast already checked by parseForecast.
function updatePage(response: any) {
    // these accumulate across the day's blocks, so start each render afresh
    chanceOfRainPerc = 0;
    isUmbrellaNeeded = false;
    rainTotalExpected = 0;
    minTemperature = 100;

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


const MS_PER_MINUTE = 60 * 1000;
const WEATHER_TIMEOUT_MS = 15 * 1000; // give up on a request that hangs (open-meteo sometimes stops answering)
const REFRESH_INTERVAL_MS = 10 * MS_PER_MINUTE; // between updates when the last one worked
const RETRY_INTERVAL_MS = 1 * MS_PER_MINUTE; // between retries after a failure
const UPDATE_CHECK_INTERVAL_MS = 5 * 1000; // how often to check whether an update is due
const CACHE_KEY_PREFIX = "weatherCache:";

// The forecast parts of the page as first loaded, so a forecast can be wiped without reloading the page.
const FORECAST_ELEMENT_IDS = ["currentIconBox", "currentTemperatureBox", "todayRainBox", "weather_box"];
const blankForecastHtml = new Map(FORECAST_ELEMENT_IDS.map(id => [id, document.getElementById(id)?.innerHTML ?? ""]));

let lastAttemptTime: Date = new Date(0);
let lastAttemptOk: boolean = false;
let requestInFlight: boolean = false;
let shownForecast: { body: string, date: string, fetchedAt: Date } | null = null; // the forecast on screen

class WeatherFetchError extends Error {}

function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
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

function loadTodaysCache(): CachedWeather | null {
    try {
        return usableCache(localStorage.getItem(CACHE_KEY_PREFIX + city), todayInZone(new Date()));
    } catch {
        return null; // storage disabled
    }
}

// Puts the forecast parts of the page back as first loaded: blank, and with any hidden blocks shown again.
function clearForecast() {
    for (const [id, html] of blankForecastHtml) {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = html;
        }
    }
    resetOutfitOptions();
    setElementBlock("weatherLastUpdated", "");
    shownForecast = null;
}

// Draws a forecast from scratch. Throws if it cannot be drawn: before touching the page if the
// forecast is incomplete, otherwise after clearing it, so a half-drawn forecast is never left on screen.
function renderForecast(body: string, fetchedAt: Date) {
    const forecast = parseForecast(body);
    clearForecast();
    try {
        updatePage(forecast);
    } catch (error) {
        clearForecast(); // never leave a half-drawn forecast
        throw error;
    }
    shownForecast = { body: body, date: forecastDate(forecast), fetchedAt: fetchedAt };
    setElementBlock("weatherLastUpdated", fetchedAt.toLocaleString());
}

async function fetchWeather(url: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), WEATHER_TIMEOUT_MS);
    try {
        // the timeout covers reading the body too: a server can send headers and then stall
        const response = await fetch(url, { signal: controller.signal });
        const body = await response.text();
        if (!response.ok) {
            throw new WeatherFetchError(describeHttpError(response.status, response.statusText, body));
        }
        return body;
    } catch (error) {
        if (error instanceof WeatherFetchError) {
            throw error;
        }
        if (controller.signal.aborted) {
            throw new WeatherFetchError(`no response after ${WEATHER_TIMEOUT_MS / 1000}s (timed out)`);
        }
        throw new WeatherFetchError(`network error (${error instanceof Error ? error.message : error})`);
    } finally {
        clearTimeout(timer);
    }
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
        "&timezone=" + encodeURIComponent(FORECAST_TIME_ZONE) +
        "&current=temperature_2m,apparent_temperature,is_day,precipitation,precipitation_probability,rain,showers,snowfall,weather_code" +
        "&forecast_days=1" +
        "&hourly=temperature_2m,weathercode,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth";

    try {
        const body = await fetchWeather(url);
        const previous = shownForecast;
        try {
            renderForecast(body, lastAttemptTime);
        } catch (error) {
            if (previous) {
                renderForecast(previous.body, previous.fetchedAt); // keep the last good forecast on screen
            }
            throw new WeatherFetchError(`unexpected response (${error instanceof Error ? error.message : error})`);
        }
        saveToCache(body, lastAttemptTime);
        lastAttemptOk = true;
        showWeatherError(null);
    } catch (error) {
        lastAttemptOk = false;
        const reason = error instanceof WeatherFetchError ? error.message : `unexpected error (${error})`;
        console.log(`Failed to fetch weather data: ${reason}`);
        handleFailure(reason);
    } finally {
        requestInFlight = false;
    }
}

// After a failed update: keep today's forecast on screen, fall back to today's cached one, or show nothing.
function handleFailure(reason: string) {
    let note = `retrying every ${RETRY_INTERVAL_MS / MS_PER_MINUTE} min`;

    if (shownForecast?.date !== todayInZone(new Date())) {
        clearForecast(); // an old day's forecast is worse than none
        const cached = loadTodaysCache();
        if (cached) {
            try {
                renderForecast(cached.body, new Date(cached.savedAt));
            } catch {
                // a cache we cannot draw is no use: stay blank
            }
        }
    }
    if (shownForecast) {
        note = `showing the forecast from ${formatTime(shownForecast.fetchedAt)}; ${note}`;
    }

    showWeatherError(`Weather update failed at ${formatTime(lastAttemptTime)}: ${reason} (${note})`);
}

function checkIfWeatherNeedsAnUpdate() {
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
setInterval(checkIfWeatherNeedsAnUpdate, UPDATE_CHECK_INTERVAL_MS);