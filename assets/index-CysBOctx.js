true&&(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
}());

const zeroFill = (n) => ('0' + n).slice(-2);
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function getOrdinal(n) {
    const ord = ["st", "nd", "rd"];
    const exceptions = [11, 12, 13];
    if (exceptions.includes(n % 100)) {
        return n + "th";
    }
    const suffix = ord[(n % 10) - 1] || "th";
    return n + suffix;
}
function updateDate() {
    let now = new Date();
    const currentDayOfWeek = daysOfWeek[now.getDay()];
    const dayOfMonth = getOrdinal(now.getDate());
    const month = now.toLocaleString('default', { month: 'long' });
    const dateElement = document.getElementById('date');
    if (dateElement) {
        dateElement.innerHTML = `${currentDayOfWeek} ${dayOfMonth} ${month} ${now.getFullYear()}`;
    }
}
function updateTime() {
    let now = new Date();
    const dateTime = zeroFill(now.getHours()) + ':' + zeroFill(now.getMinutes()) + ':' + zeroFill(now.getSeconds());
    const timeElement = document.getElementById('time');
    if (timeElement) {
        timeElement.innerHTML = dateTime;
    }
}
function scheduleUpdateDate() {
    updateDate();
    let now = new Date();
    const timeToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    setTimeout(() => {
        updateDate();
        setInterval(updateDate, 24 * 60 * 60 * 1000); // Update every 24 hours
    }, timeToMidnight);
}
scheduleUpdateDate();
setInterval(updateTime, 1000);

const weatherConfig = {
    blockMorningHours: [8, 9, 10, 11, 12],
    blockAfternoonHours: [12, 14, 15, 16, 17, 18],
    blockEveningHours: [19, 20, 21, 22, 23],
    removePastBlocks: false
};

const clearSkyIcon = ""+new URL('images/icon-sun-96.png', import.meta.url).href+"";

const mainlyClearIcon = ""+new URL('images/icon-mainly-clear-day-96.png', import.meta.url).href+"";

const partlyCloudyIcon = ""+new URL('images/icon-partly-cloudy-96.png', import.meta.url).href+"";

const overCastIcon = "data:image/png;base64,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";

const fogIcon = "data:image/png;base64,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";

const drizzleHeavyIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAC3klEQVR4nO3WQVPaQBjGcSgkwACGAt+Z5UOopYeKwYNK8WIpPaioB5XCR2A3DKLEAdQ4jW8nXJtO1sPWTvb5zTyn7Pxnb5tEAgAAAAAAAAAAAADgPzQiszqiemVIojoiCt2QeHVILDirXUe16tBn1eEryc1nunWUKw98Ufn5SjIrD3xHt45y5YHPK4NXkps/1q2jXPnGZ5Ubn2RWvvZrunXUG5FZvvLZx+tfvHy9vswfW3+78iMfvXIcOwAAAADwbkZkli69unXhidLlC4XNunjhpUsv8tcwlh3VSuceK128kNTOPaZbRzmr74nSeXCJ6Fl9z9Gto9xG3+NW3yOZbfS9sW4d5awzj1lnHkmupltHvRGZ1skT2zh95tbpM4Vt/e3kKfLRi2UHAAAAAN5sRGaxt6oXe4+i+OORQtd75MXeKvKXrhjHjmr53ooVeiuSWXBWt45yhe5KFL6vSGrdlaNbR7lCd8kL3fUlJLYc69ZRLn+8YPlvS5LboqZbRz2bzPVljxc8f7yk8AXfFiw4q10HAAAAAN6NTWbuyK1nO67IHT1Q2LIdl+c6D5G/hrHsqBZcINd5IMkx3TrKZdpzkf3qkswy7bmjW0e5TNvl2bZLMsscumPdOsplDl2WPXRJZpmDeU23jno2mZn9e2YezHnmYE5hW3/bv4989GLZAQAAAIA3s8k0WrO60boTxt4dhS3duuPG3izyl86IY0c1w54xozUjqdkzpltHOWN3Jgx7fQmZObp1lEvvTnl695ak1pyOdesol2pOWboZXCJ6qea0pltHPZvM1JcpS+9MeXrnlsI35cGZqEcvFccOAAAAALwbe2QmG5P6h4YjPnyeUOgaDk82Jiw4q11HteACycaEJMd06yiX3BYi+ckhuQlHt45yyW3Bk9sOSW3LGevWUW9TsMSWQ3ITNe06ygUPUHDZTcETm4L+Mr4+E/HoxbIDAAAAAAAAAAAAAJD4p34DO2tzbFuS2bYAAAAASUVORK5CYII=";

const hailIcon = ""+new URL('images/icon-hail-96.png', import.meta.url).href+"";

const rainCloudIcon = ""+new URL('images/icon-rain-cloud-96.png', import.meta.url).href+"";

const rainCloudSunBehindIcon = ""+new URL('images/icon-rain-cloud-sunbehind-96.png', import.meta.url).href+"";

const sleetIcon = ""+new URL('images/icon-sleet-96.png', import.meta.url).href+"";

const wetIcon = "data:image/png;base64,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";

const rainIcon = ""+new URL('images/icon-rain-96.png', import.meta.url).href+"";

const heavyRainIcon = ""+new URL('images/icon-heavy-rain-96.png', import.meta.url).href+"";

const torrentialRainIcon = ""+new URL('images/icon-torrential-rain-96.png', import.meta.url).href+"";

const snowIcon = ""+new URL('images/icon-snow-96.png', import.meta.url).href+"";

const snowStormIcon = "data:image/png;base64,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";

const lightSnowIcon = ""+new URL('images/icon-light-snow-96.png', import.meta.url).href+"";

const stormIcon = ""+new URL('images/icon-storm-96.png', import.meta.url).href+"";

const stormyWeatherIcon = ""+new URL('images/icon-stormy-weather-96.png', import.meta.url).href+"";

const umbrellaIcon = "data:image/png;base64,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";

const umbrellaClosedIcon = "data:image/png;base64,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";

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
            // 2 Partly cloudy
            return partlyCloudyIcon;
        }
        case 3: {
            // 3 Overcast
            return overCastIcon;
        }
        case 45: {
            // 45 Fog
            return fogIcon;
        }
        case 48: {
            // 48 Depositing rime fog
            return fogIcon;
        }
        case 51: {
            // 51 Drizzle: Light
            return rainCloudIcon;
        }
        case 53: {
            // 53 Drizzle: Moderate
            return rainCloudSunBehindIcon;
        }
        case 55: {
            // 55 Drizzle: Dense intensity
            return drizzleHeavyIcon;
        }
        case 56: {
            // 56 Freezing Drizzle: Light
            return sleetIcon;
        }
        case 57: {
            // 57 Freezing Drizzle: Dense intensity
            return wetIcon;
        }
        case 61: {
            // 61 Rain: Slight
            return rainIcon;
        }
        case 63: {
            // 63 Rain: Moderate
            return heavyRainIcon;
        }
        case 65: {
            // 65 Rain: Heavy intensity
            return torrentialRainIcon;
        }
        case 66: {
            // 66 Freezing Rain: Light
            return sleetIcon;
        }
        case 67: {
            // 67 Freezing Rain: Heavy intensity
            return hailIcon;
        }
        case 71: {
            // 71 Snow fall: Slight
            return sleetIcon;
        }
        case 73: {
            // 73 Snow fall: Moderate
            return snowIcon;
        }
        case 75: {
            // 75 Snow fall: Heavy intensity
            return snowStormIcon;
        }
        case 77: {
            // 77 Snow grains
            return snowStormIcon;
        }
        case 80: {
            // 80 Rain showers: Slight
            return rainIcon;
        }
        case 81: {
            // 81 Rain showers: Moderate
            return heavyRainIcon;
        }
        case 82: {
            // 82 Rain showers: Violent
            return torrentialRainIcon;
        }
        case 85: {
            // 85 Snow showers: Slight
            return lightSnowIcon;
        }
        case 86: {
            // 86 Snow showers: Heavy
            return snowStormIcon;
        }
        case 95: {
            // 95 Thunderstorm: Slight or moderate
            return stormIcon;
        }
        case 96: {
            // 96 Thunderstorm with slight and heavy hail
            return stormyWeatherIcon;
        }
        case 99: {
            // 99 Thunderstorm: Heavy hail
            return stormyWeatherIcon;
        }
        default: {
            // Default case for unknown weather codes
            return stormyWeatherIcon;
        }
    }
}
function getWeatherDescription(weatherCode) {
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
function getUmbrellaIcon(rainingHard) {
    return rainingHard ? umbrellaIcon : umbrellaClosedIcon;
}
function getWorstWeatherCode(weatherCodes) {
    return Math.max(...weatherCodes);
}

const morningBlockName = "Morning";
const afternoonBlockName = "Afternoon";
const eveningBlockName = "Evening";
let chanceOfRainPerc = 0;
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
function getWeatherElementForHours(hourly_weather_element, hours, usePreviousHours) {
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
function getTemperatureBlock(blockName, hourly_weather_data, current_hour) {
    let hours = getHours(blockName);
    // assume we always have a 24hrs array of numbers in the hourly_weather_data, therefore indices match hours
    // a bunch of the weather elements are for previous hour
    const tempByHour = getWeatherElementForHours(hourly_weather_data.temperature_2m, hours, false);
    const tempFeelsLikeByHour = getWeatherElementForHours(hourly_weather_data.apparent_temperature, hours, false);
    const precepitationPercByHour = getWeatherElementForHours(hourly_weather_data.precipitation_probability, hours, true);
    const rainfallByHour = getWeatherElementForHours(hourly_weather_data.rain, hours, true);
    const snowfallByHour = getWeatherElementForHours(hourly_weather_data.snowfall, hours, true);
    const weatherCodeByHour = getWeatherElementForHours(hourly_weather_data.weathercode, hours, false);
    const lastHour = hours.length === 0 ? 0 : hours[hours.length - 1];
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
    };
}
function getCurrentChanceOfRain(percentageChance, now) {
    if (percentageChance === 0)
        return now ? "No Rain" : "No Rain expected";
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
function updateGlobalRainDetails(block) {
    if (chanceOfRainPerc < block.precepitationPercHighest) {
        chanceOfRainPerc = block.precepitationPercHighest;
    }
}
function updateBlock(blockName, elementName, boxName, iconName, currentHour, response) {
    const block = getTemperatureBlock(blockName, response.hourly, currentHour);
    {
        updateGlobalRainDetails(block);
        const tempString = `${block.tempMin}°C | ${block.tempMax}°C`;
        const tempFeelsLikeString = `${block.tempFeelsLikeMin}°C | ${block.tempFeelsLikeMax}°C`;
        const conditionsString = `${getWeatherDescription(block.weatherCode)}`;
        const percString = `${getCurrentChanceOfRain(block.precepitationPercHighest, false)}`;
        setElementBlock(elementName + "Title", `${block.blockName}`);
        document.getElementById(iconName).src = getWeatherImage(block.weatherCode);
        setElementBlock(elementName + "Temp", `${tempString}`);
        setElementBlock(elementName + "TempFeelsLike", `${tempFeelsLikeString}`);
        setElementBlock(elementName + "CurrentConditions", `${conditionsString}`);
        setElementBlock(elementName + "CurrentRain", `${percString}`);
    }
}
function updateCurrentBlock(response, weatherCode) {
    setElementBlock("currentTemperature", `${response.current.temperature_2m}°C`);
    setElementBlock("currentTemperatureFeelsLike", `${response.current.apparent_temperature}°C`);
    setElementBlock("currentConditions", getWeatherDescription(weatherCode));
    setElementBlock("currentRain", getCurrentChanceOfRain(response.current.rain, true));
    document.getElementById('currentWeatherIcon').src = getWeatherImage(weatherCode);
}
function updateDayBlocks(response, currentHour) {
    updateBlock(morningBlockName, "blockMorning", "morning_box", 'morningWeatherIcon', currentHour, response);
    updateBlock(afternoonBlockName, "blockAfternoon", "afternoon_box", 'afternoonWeatherIcon', currentHour, response);
    updateBlock(eveningBlockName, "blockEvening", "evening_box", 'eveningWeatherIcon', currentHour, response);
}
function updateChanceOfRainBlock() {
    const chanceOfRainStr = `${chanceOfRainPerc}%`;
    setElementBlock("carryUmbrealla", `${chanceOfRainStr}`);
    const umbrellaIcon = "umbrellaIcon";
    //if (isUmbrellaNeeded) {
    {
        //(document.getElementById(umbrellaIcon) as HTMLImageElement).src = getUmbrellaIcon(rainTotalExpected > 10);
        document.getElementById(umbrellaIcon).src = getUmbrellaIcon(true);
    }
}
function updatePage(pageResponse) {
    const response = JSON.parse(pageResponse);
    console.log(response);
    const currentHour = new Date().getHours();
    const weatherCode = response.current.weather_code;
    updateCurrentBlock(response, weatherCode);
    updateDayBlocks(response, currentHour);
    updateChanceOfRainBlock();
    setElementBlock("currentHour", currentHour);
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
