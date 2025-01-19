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

const clearSkyIcon = ""+new URL('images/icon-sun-96.png', import.meta.url).href+"";

const mainlyClearIcon = ""+new URL('images/icon-mainly-clear-day-96.png', import.meta.url).href+"";

const partlyCloudyIcon = ""+new URL('images/icon-partly-cloudy-96.png', import.meta.url).href+"";

const overCastIcon = "data:image/png;base64,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";

const fogIcon = "data:image/png;base64,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";

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
                //const temperature = new WeatherData(xhr.responseText).getTemperature();
                const response = JSON.parse(xhr.responseText);
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
