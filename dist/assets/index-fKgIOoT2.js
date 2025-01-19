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

const zeroFill = n => {
    return ('0' + n).slice(-2);
};

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getOrdinal(n) {
    let ord = ["st", "nd", "rd"];
    let exceptions = [11, 12, 13];
    let nth = ord[(n % 10) - 1] === undefined || exceptions.includes(n % 100) ? "th" : ord[(n % 10) - 1];
    return n + nth
}

function updateDate()
{
    const now = new Date();
    const currentDayOfWeek = daysOfWeek[now.getDay()];
    const month = now.toLocaleString('default', { month: 'long' });
    document.getElementById('date').innerHTML = currentDayOfWeek + ' ' + ' ' + getOrdinal(now.getDay()) + ' ' + month + ' ' + now.getFullYear();
}

function updateTime()
{
    // Creates interval
    // Get current time
    const now = new Date();

    // Format date as in mm/dd/aaaa hh:ii:ss
    const dateTime = zeroFill(now.getHours()) + ':' + zeroFill(now.getMinutes()) + ':' + zeroFill(now.getSeconds());

    // Display the date and time on the screen using div#date-time
    document.getElementById('time').innerHTML = dateTime;
}

setInterval(updateDate, 1000);
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
