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
import clearSkyIcon from '../public/assets/images/icon-sun-96.png';
import mainlyClearIcon from '../public/assets/images/icon-mainly-clear-day-96.png';
import partlyCloudyIcon from '../public/assets/images/icon-partly-cloudy-96.png';
import overCastIcon from '../public/assets/images/icon-cloud-64.png';
import fogIcon from '../public/assets/images/icon-fog-96.png';
function getWeatherImage(weatherCode) {
    switch (weatherCode) {
        case 0: {
            // 0 Clear sky
            return clearSkyIcon;
        }
        case 1: {
            // 1 Mainly clear
            return mainlyClearIcon;
        }
        case 2: {
            // 2 partly cloudy
            return partlyCloudyIcon;
        }
        case 3: {
            // 3 overcast
            return overCastIcon;
        }
        default: {
            return fogIcon;
        }
    }
}
function getTempBlock(blockName) {
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
    };
}
function updatePage(pageResponse) {
    //const temperature = new WeatherData(xhr.responseText).getTemperature();
    const response = JSON.parse(pageResponse);
    console.log(response);
    const temperature = `Temperature: ${response.hourly.temperature_2m[0]}°C`;
    console.log(temperature); // Log or set the temperature
    const weatherElement = document.getElementById("weather");
    if (weatherElement) {
        weatherElement.textContent = temperature;
    }
    const weatherCode = response.current_weather.weathercode;
    const weatherIcon = getWeatherImage(weatherCode);
    document.getElementById('amWeatherIcon').src = weatherIcon;
    // update the blocks
    const morningBlock = getTempBlock("Morning Block");
    const blocmMorningElement = document.getElementById("blockMorning");
    if (blocmMorningElement) {
        blocmMorningElement.textContent = weatherConfig.blockMorningHours.toString() + morningBlock.blockName;
    }
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
        "&current_weather=true" +
        "&current=temperature_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code" +
        "&forecast_days=1" +
        "&hourly=temperature_2m,weathercode,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                updatePage(xhr.responseText);
            }
            catch (error) {
                console.log("Failed to parse the weather data.");
            }
        }
        else {
            console.log("Failed to fetch weather data.");
        }
    };
    xhr.send();
}
getWeatherData();
