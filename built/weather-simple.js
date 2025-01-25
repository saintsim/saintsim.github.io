import { weatherConfig } from './config';
import { getWeatherImage, getWeatherDescription, getWorstWeatherCode } from './weather-codes';
export const morningBlockName = "Morning Block";
export const afternoonBlockName = "Afternoon Block";
export const eveningBlockName = "Evening Block";
function getHours(blockName) {
    switch (blockName) {
        case morningBlockName:
            return weatherConfig.blockMorningHours;
        case afternoonBlockName:
            return weatherConfig.blockAfternoonHours;
        case eveningBlockName:
            return weatherConfig.blockEveningHours;
        default:
            return [];
    }
}
function getWeatherElementForHourshours(hourly_weather_element, hours, usePreviousHours) {
    const weatherByHour = [];
    for (const hour of hours) {
        const hourToUse = usePreviousHours ? hour - 1 : hour;
        if (hourToUse < 0)
            continue;
        weatherByHour.push(hourly_weather_element[hourToUse]);
    }
    return weatherByHour;
}
function sumArray(numbers) {
    return numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}
function getTemperatureBlock(blockName, hourly_weather_data) {
    const hours = getHours(blockName);
    // assume we always have a 24hrs array of numbers in the hourly_weather_data, therefore indices match hours
    // a bunch of the weather elements are for previous hour
    const tempByHour = getWeatherElementForHourshours(hourly_weather_data.temperature_2m, hours, false);
    const tempFeelsLikeByHour = getWeatherElementForHourshours(hourly_weather_data.apparent_temperature, hours, false);
    const precepitationPercByHour = getWeatherElementForHourshours(hourly_weather_data.precipitation_probability, hours, true);
    const rainfallByHour = getWeatherElementForHourshours(hourly_weather_data.rain, hours, true);
    const snowfallByHour = getWeatherElementForHourshours(hourly_weather_data.snowfall, hours, true);
    const weatherCodeByHour = getWeatherElementForHourshours(hourly_weather_data.weathercode, hours, false);
    return {
        blockName: blockName,
        blockStartHour: hours[0], // 24hr clock notation
        blockEndHour: hours[hours.length - 1], // 24hr clock notation
        tempMin: Math.min(...tempByHour),
        tempMax: Math.max(...tempByHour),
        tempFeelsLikeMin: Math.min(...tempFeelsLikeByHour),
        tempFeelsLikeMax: Math.max(...tempFeelsLikeByHour),
        precepitationPercHighest: Math.max(...precepitationPercByHour),
        totalRainfall: sumArray(rainfallByHour),
        totalSnowfall: sumArray(snowfallByHour),
        weatherCode: getWorstWeatherCode(weatherCodeByHour)
    };
}
function getCurrentChanceOfRain(percentageChance, now) {
    if (percentageChance === 0)
        return now ? "No rain currently" : "No rain expected";
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
function updateBlock(blockName, elementName, iconName, response) {
    const block = getTemperatureBlock(blockName, response.hourly);
    const tempString = `${block.tempMin}°C (${block.tempFeelsLikeMin}°C) | ${block.tempMax}°C (${block.tempFeelsLikeMax}°C)`;
    const conditionsString = `${getWeatherDescription(block.weatherCode)}`;
    const percString = `${getCurrentChanceOfRain(block.precepitationPercHighest, false)}`;
    setElementBlock(elementName, `${tempString} / ${conditionsString} / ${percString}`);
    document.getElementById(iconName).src = getWeatherImage(block.weatherCode);
}
function updatePage(pageResponse) {
    const response = JSON.parse(pageResponse);
    console.log(response);
    const weatherCode = response.current.weather_code;
    setElementBlock("currentTemperature", `${response.current.temperature_2m}°C (${response.current.apparent_temperature}°C)`);
    setElementBlock("currentConditions", getWeatherDescription(weatherCode));
    setElementBlock("currentRain", getCurrentChanceOfRain(response.current.rain, true));
    document.getElementById('currentWeatherIcon').src = getWeatherImage(weatherCode);
    // update the blocks
    updateBlock(morningBlockName, "blockMorning", 'morningWeatherIcon', response);
    updateBlock(afternoonBlockName, "blockAfternoon", 'afternoonWeatherIcon', response);
    updateBlock(eveningBlockName, "blockEvening", 'eveningWeatherIcon', response);
    //    const morningBlock = getTemperatureBlock(morningBlockName, response.hourly);
    //    const morningTempString = `${morningBlock.tempMin}°C (${morningBlock.tempFeelsLikeMin}°C) | ${morningBlock.tempMax}°C (${morningBlock.tempFeelsLikeMax}°C)`
    //    const morningConditionsString = `${getWeatherDescription(morningBlock.weatherCode)}`;
    //    const morningPercString = `${getCurrentChanceOfRain(morningBlock.precepitationPercHighest)}`;
    //    setElementBlock("blockMorning", `${weatherConfig.blockMorningHours.toString()} / ${morningTempString} / ${morningConditionsString} / ${morningPercString}`);
    //    (document.getElementById('morningWeatherIcon') as HTMLImageElement).src = getWeatherImage(morningBlock.weatherCode);
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
