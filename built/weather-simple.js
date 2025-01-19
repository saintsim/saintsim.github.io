"use strict";
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
