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
                    const weatherCode: number = response.current_weather.weathercode;
                    const weatherIcon: string = getWeatherImage(weatherCode);
                    (document.getElementById('amWeatherIcon') as HTMLImageElement).src = weatherIcon;
                } catch (error) {
                    console.log("Failed to parse the weather data.");
                }
        } else {
            console.log("Failed to fetch weather data.");
        }
    };
    xhr.send();
}

getWeatherData();