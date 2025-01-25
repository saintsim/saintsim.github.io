import { weatherConfig } from './config';
import { getWeatherImage, getWeatherDescription } from './weather-codes'

interface TempBlock {
    blockName: string;
    blockStartHour: number; // 24hr clock notation
    blockEndHour: number; // 24hr clock notation
    tempMin: number;
    tempMax: number;
    tempFeelsLikeMin: number;
    tempFeelsLikeMax: number;
    precepitationPercHighest: number;
    totalRainfall: number;
    totalSnowfall: number;
    weatherCode: number;
}

function getTempBlock(blockName: string): TempBlock {
    return {
        blockName: blockName,
        blockStartHour: 1, // 24hr clock notation
        blockEndHour: 2, // 24hr clock notation
        tempMin: 3,
        tempMax: 4,
        tempFeelsLikeMin: 5,
        tempFeelsLikeMax: 6,
        precepitationPercHighest: 7,
        totalRainfall: 8,
        totalSnowfall: 9,
        weatherCode: 0
    }
}

function getCurrentChanceOfRain(percentageChance: number): string {
    if (percentageChance === 0 )
        return "No rain currently"
    else {
        return `${percentageChance}% chance of rain`
    }
}

function setElementBlock(id: string, data: any) {
    const currentElement = document.getElementById(id);
    if (currentElement) {
        currentElement.textContent = data;
    }
}
function updatePage(pageResponse: string) {
    const response = JSON.parse(pageResponse);
    console.log(response);

    const weatherCode: number = response.current.weather_code;
    setElementBlock("currentTemperature", `${response.current.temperature_2m}°C (${response.current.apparent_temperature}°C)`);
    setElementBlock("currentConditions", getWeatherDescription(weatherCode));
    setElementBlock("currentRain", getCurrentChanceOfRain(response.current.rain));

    (document.getElementById('amWeatherIcon') as HTMLImageElement).src = getWeatherImage(weatherCode);

    // update the blocks
    const morningBlock = getTempBlock("Morning Block");

    setElementBlock("blockMorning", weatherConfig.blockMorningHours.toString() + morningBlock.blockName)

    //const afternoonBlock = getTempBlock("Afternoon Block");
    //const eveningBlock = getTempBlock("Evening Block");
}

function getWeatherData() {
    const latitude = 35.6587; // Latitude for Kachidoki, Tokyo
    const longitude = 139.7765; // Longitude for Kachidoki, Tokyo
    const url = "https://api.open-meteo.com/v1/forecast?" +
        "latitude=" + latitude +
        "&longitude=" + longitude +
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
}

getWeatherData();