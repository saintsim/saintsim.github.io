import { weatherConfig } from './config';
import { getWeatherImage, getWeatherDescription, getWorstWeatherCode, getUmbrellaIcon } from './weather-codes'

export const morningBlockName: string = "Morning Block"
export const afternoonBlockName: string = "Afternoon Block"
export const eveningBlockName: string = "Evening Block"

export let chanceOfRainPerc: number = 0
export let isUmbrellaNeeded: boolean = false
export let rainTotalExpected: number = 0

interface TemperatureBlock {
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
        if (hourToUse < 0)
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
    hours = removePastHours(hours, current_hour)

    // assume we always have a 24hrs array of numbers in the hourly_weather_data, therefore indices match hours
    // a bunch of the weather elements are for previous hour
    const tempByHour: number[] = getWeatherElementForHours(hourly_weather_data.temperature_2m, hours, false)
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
        tempMin: tempByHour.length === 0 ? 0 : Math.min(...tempByHour),
        tempMax: tempByHour.length === 0 ? 0 : Math.max(...tempByHour),
        tempFeelsLikeMin: tempFeelsLikeByHour.length === 0 ? 0 : Math.min(...tempFeelsLikeByHour),
        tempFeelsLikeMax: tempFeelsLikeByHour.length === 0 ? 0 : Math.max(...tempFeelsLikeByHour),
        precepitationPercHighest: precepitationPercByHour.length === 0 ? 0 : Math.max(...precepitationPercByHour),
        totalRainfall: sumArray(rainfallByHour),
        totalSnowfall: sumArray(snowfallByHour),
        weatherCode: getWorstWeatherCode(weatherCodeByHour),
        pastData: current_hour > lastHour
    }
}

function getCurrentChanceOfRain(percentageChance: number, now: boolean): string {
    if (percentageChance === 0 )
        return now ? "No rain currently" : "No rain expected";
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

function hideBlock(id: string) {
    const currentElement = document.getElementById(id);
    if (currentElement) {
        currentElement.hidden = true;
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
}

function updateBlock(blockName: string, elementName: string, iconName: string, currentHour: number, response: any) {
    const block = getTemperatureBlock(blockName, response.hourly, currentHour);

    if (block.pastData) {
        hideBlock(elementName);
        hideBlock(iconName);
    } else {
        updateGlobalRainDetails(block)

        const tempString = `${block.tempMin}°C (${block.tempFeelsLikeMin}°C) | ${block.tempMax}°C (${block.tempFeelsLikeMax}°C)`
        const conditionsString = `${getWeatherDescription(block.weatherCode)}`;
        const percString = `${getCurrentChanceOfRain(block.precepitationPercHighest, false)}`;

        setElementBlock(elementName, `${block.blockName} (${block.blockStartHour}-${block.blockEndHour}): ${tempString} / ${conditionsString} / ${percString}`);
        (document.getElementById(iconName) as HTMLImageElement).src = getWeatherImage(block.weatherCode);
    }
}

function updateCurrentBlock(response: any, weatherCode: number) {
    setElementBlock("currentTemperature", `${response.current.temperature_2m}°C (${response.current.apparent_temperature}°C)`);
    setElementBlock("currentConditions", getWeatherDescription(weatherCode));
    setElementBlock("currentRain", getCurrentChanceOfRain(response.current.rain, true));
    (document.getElementById('currentWeatherIcon') as HTMLImageElement).src = getWeatherImage(weatherCode);
}

function updateDayBlocks(response: any, currentHour: number) {
    updateBlock(morningBlockName, "blockMorning", 'morningWeatherIcon', currentHour, response)
    updateBlock(afternoonBlockName, "blockAfternoon", 'afternoonWeatherIcon', currentHour, response)
    updateBlock(eveningBlockName, "blockEvening", 'eveningWeatherIcon', currentHour, response)
}

function updateChanceOfRainBlock() {
    const chanceOfRainStr = `chance: ${chanceOfRainPerc}%`
    setElementBlock("carryUmbrealla", isUmbrellaNeeded ? `Carry an umbrella (${chanceOfRainStr})` : `No umbrella needed! (${chanceOfRainStr})`)
    const umbrellaIcon: string = "umbrellaIcon"
    if (isUmbrellaNeeded) {
        (document.getElementById(umbrellaIcon) as HTMLImageElement).src = getUmbrellaIcon(rainTotalExpected > 10);
    } else {
        hideBlock(umbrellaIcon);
    }
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