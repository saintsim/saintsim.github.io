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
