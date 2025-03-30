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

let lastUpdatedTime: Date;
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


function getWeatherData() {
    const url = "https://api.open-meteo.com/v1/forecast?" +
        "latitude=" + cityLatLong.latitude +
        "&longitude=" + cityLatLong.longitude +
        "&timezone=Asia%2FTokyo" +
        "&current=temperature_2m,apparent_temperature,is_day,precipitation,precipitation_probability,rain,showers,snowfall,weather_code" +
        "&forecast_days=1" +
        "&hourly=temperature_2m,weathercode,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth";

    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    updatePage(xhr.responseText);
                } catch (error) {
                    console.log("Failed to parse the weather data.");
                }
        } else {
            if (xhr.status !== 200) {
                console.log(`Failed to fetch weather data: ${xhr.status} / ${xhr.readyState}`);
            }
        }
    };
    xhr.send();
    lastUpdatedTime = new Date();
    setElementBlock("weatherLastUpdated", lastUpdatedTime)
}

function checkIfWeatherNeedsAnUpdate() {
    // if not updated for 10mins, update
    if ((new Date().getTime() - lastUpdatedTime.getTime()) > 600000) {
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