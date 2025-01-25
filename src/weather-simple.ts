// class WeatherData {
//     apiData: string;
//     constructor(apiData: string) {
//         this.apiData = apiData;
//     }
//     getTemperature() {
//         const response = JSON.parse(this.apiData);
//         console.log(response);
//         return `Temperature: ${response.hourly.temperature_2m[0]}°C`;
//     }
// }

import { weatherConfig } from './config';
import clearSkyIcon from '../public/assets/images/icon-sun-96.png'
import mainlyClearIcon from '../public/assets/images/icon-mainly-clear-day-96.png'
import partlyCloudyIcon from '../public/assets/images/icon-partly-cloudy-96.png'
import overCastIcon from '../public/assets/images/icon-cloud-64.png'
import fogIcon from '../public/assets/images/icon-fog-96.png'

function getWeatherImage(weatherCode: number): string {
    switch(weatherCode) {
        case 0: {
            // 0 Clear sky
           return clearSkyIcon
        }
        case 1: {
            // 1 Mainly clear
            return mainlyClearIcon
        }
        case 2: {
            // 2 partly cloudy
            return partlyCloudyIcon
         }
         case 3: {
             // 3 overcast
             return overCastIcon
          }
        default: {
            return fogIcon
        }
     }
}

function getWeatherDescription(weatherCode: number): string {
    switch (weatherCode) {
        case 0:
            return "Clear sky";
        case 1:
            return "Mainly clear";
        case 2:
            return "Partly cloudy";
        case 3:
            return "Overcast";
        case 45:
            return "Fog";
        case 48:
            return "Depositing rime fog";
        case 51:
            return "Drizzle: Light";
        case 53:
            return "Drizzle: Moderate";
        case 55:
            return "Drizzle: Dense intensity";
        case 56:
            return "Freezing Drizzle: Light";
        case 57:
            return "Freezing Drizzle: Dense intensity";
        case 61:
            return "Rain: Slight";
        case 63:
            return "Rain: Moderate";
        case 65:
            return "Rain: Heavy intensity";
        case 66:
            return "Freezing Rain: Light";
        case 67:
            return "Freezing Rain: Heavy intensity";
        case 71:
            return "Snow fall: Slight";
        case 73:
            return "Snow fall: Moderate";
        case 75:
            return "Snow fall: Heavy intensity";
        case 77:
            return "Snow grains";
        case 80:
            return "Rain showers: Slight";
        case 81:
            return "Rain showers: Moderate";
        case 82:
            return "Rain showers: Violent";
        case 85:
            return "Snow showers: Slight";
        case 86:
            return "Snow showers: Heavy";
        case 95:
            return "Thunderstorm: Slight or moderate";
        case 96:
            return "Thunderstorm with slight and heavy hail";
        case 99:
            return "Thunderstorm: Heavy hail";
        default:
            return "Unknown";
    }
}

// // 0 Clear sky
// // 1 Mainly clear
// // 2 partly cloudy
// // 3 overcast
// // 45 Fog
// // 48 depositing rime fog
// // 51 Drizzle: Light
// // 53 Drizzle: moderate
// // 55 Drizzile:  dense intensity
// // 56 Freezing Drizzle: Light
// // 57 Freezing Drizzle: dense intensity
// // 61 Rain: Slight
// // 63 Rain moderate
// // 65 Rain heavy intensity
// // 66 Freezing Rain: Light
// // 67 Freezing rain heavy intensity
// // 71 Snow fall: Slight
// // 73 Snow fall moderate
// // 75 Snow fall heavy intensity
// // 77 Snow grains
// // 80 Rain showers: Slight
// // 81 Rain showers moderate
// // 82 Rain showers violent
// // 85 Snow showers slight
// // 86 Snow showers heavy
// // 95 Thunderstorm: Slight or moderate
// // 96 Thunderstorm with slight and heavy hail
// // 99 *	Thunderstorm heavy hail

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