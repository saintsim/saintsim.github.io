import clearSkyIcon from '../public/assets/images/icon-sun-96.png';
import mainlyClearIcon from '../public/assets/images/icon-mainly-clear-day-96.png';
import partlyCloudyIcon from '../public/assets/images/icon-partly-cloudy-96.png';
import overCastIcon from '../public/assets/images/icon-cloud-64.png';
import fogIcon from '../public/assets/images/icon-fog-96.png';
import drizzleHeavyIcon from '../public/assets/images/icon-drizzle-heavy-96.png';
import hailIcon from '../public/assets/images/icon-hail-96.png';
import rainCloudIcon from '../public/assets/images/icon-rain-cloud-96.png';
import rainCloudSunBehindIcon from '../public/assets/images/icon-rain-cloud-sunbehind-96.png';
import sleetIcon from '../public/assets/images/icon-sleet-96.png';
import wetIcon from '../public/assets/images/icon-wet-96.png';
import rainIcon from '../public/assets/images/icon-rain-96.png';
import heavyRainIcon from '../public/assets/images/icon-heavy-rain-96.png';
import torrentialRainIcon from '../public/assets/images/icon-torrential-rain-96.png';
import snowIcon from '../public/assets/images/icon-snow-96.png';
import snowStormIcon from '../public/assets/images/icon-snow-storm-96.png';
import lightSnowIcon from '../public/assets/images/icon-light-snow-96.png';
import stormIcon from '../public/assets/images/icon-storm-96.png';
import stormyWeatherIcon from '../public/assets/images/icon-stormy-weather-96.png';
import umbrellaIcon from '../public/assets/images/icon-umbrella-80.png';
import umbrellaClosedIcon from '../public/assets/images/icon-closed-umbrella-80.png';
import umbrellaClosedGreyIcon from '../public/assets/images/icon-closed-umbrella-grey-80.png';
export function getWeatherImage(weatherCode) {
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
export function getWeatherDescription(weatherCode) {
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
            return "Rime fog";
        case 51:
            return "Drizzle: Light";
        case 53:
            return "Drizzle: Moderate";
        case 55:
            return "Drizzle: Dense";
        case 56:
            return "Freezing Drizzle: Light";
        case 57:
            return "Freezing Drizzle: Dense";
        case 61:
            return "Rain: Slight";
        case 63:
            return "Rain: Moderate";
        case 65:
            return "Rain: Heavy";
        case 66:
            return "Freezing Rain: Light";
        case 67:
            return "Freezing Rain: Heavy";
        case 71:
            return "Snow fall: Slight";
        case 73:
            return "Snow fall: Moderate";
        case 75:
            return "Snow fall: Heavy";
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
            return "Thunderstorm with slight & heavy hail";
        case 99:
            return "Thunderstorm: Heavy hail";
        default:
            return "Unknown";
    }
}
export function getUmbrellaIcon(rainPercChance) {
    if (rainPercChance > 50) {
        return umbrellaIcon;
    }
    if (rainPercChance > 0) {
        return umbrellaClosedIcon;
    }
    return umbrellaClosedGreyIcon;
}
export function getWorstWeatherCode(weatherCodes) {
    return Math.max(...weatherCodes);
}
