import { weatherConfig } from './config';
import { getWeatherImage, getWeatherDescription } from './weather-codes';
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
function getCurrentChanceOfRain(percentageChance) {
    if (percentageChance === 0)
        return "No rain currently";
    else {
        return `${percentageChance}% chance of rain`;
    }
}
function setElementBlock(id, data) {
    const currentElement = document.getElementById(id);
    if (currentElement) {
        currentElement.textContent = data;
    }
}
function updatePage(pageResponse) {
    const response = JSON.parse(pageResponse);
    console.log(response);
    const weatherCode = response.current.weather_code;
    setElementBlock("currentTemperature", `${response.current.temperature_2m}°C (${response.current.apparent_temperature}°C)`);
    setElementBlock("currentConditions", getWeatherDescription(weatherCode));
    setElementBlock("currentRain", getCurrentChanceOfRain(response.current.rain));
    document.getElementById('amWeatherIcon').src = getWeatherImage(weatherCode);
    // update the blocks
    const morningBlock = getTempBlock("Morning Block");
    setElementBlock("blockMorning", weatherConfig.blockMorningHours.toString() + morningBlock.blockName);
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
            }
            catch (error) {
                console.log("Failed to parse the weather data.");
            }
        }
        else {
            if (xhr.status !== 200) {
                console.log(`Failed to fetch weather data: ${xhr.status} / ${xhr.readyState}`);
            }
        }
    };
    xhr.send();
}
getWeatherData();
