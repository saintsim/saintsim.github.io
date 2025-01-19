"use strict";
// import { fetchWeatherApi } from 'openmeteo';
//
// // Weather codes:
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
//
// import cloudImage from '../public/assets/images/icon-cloud-64.png';
//
// const params = {
// 	"latitude": 35.6895,
// 	"longitude": 139.6917,
// 	"current": ["is_day", "weather_code"],
// 	"hourly": ["temperature_2m", "apparent_temperature", "precipitation_probability", "precipitation", "rain", "showers", "snowfall", "weather_code"],
// 	"timezone": "Asia/Tokyo",
// 	"forecast_days": 1
// };
// const url = "https://api.open-meteo.com/v1/forecast";
// const responses = await fetchWeatherApi(url, params);
//
// // Helper function to form time ranges
// const range = (start: number, stop: number, step: number) =>
// 	Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);
//
// // Process first location. Add a for-loop for multiple locations or weather models
// const response = responses[0];
//
// // Attributes for timezone and location
// const utcOffsetSeconds = response.utcOffsetSeconds();
// const timezone = response.timezone();
// const timezoneAbbreviation = response.timezoneAbbreviation();
// const latitude = response.latitude();
// const longitude = response.longitude();
//
// const current = response.current()!;
// const hourly = response.hourly()!;
//
// // Note: The order of weather variables in the URL query and the indices below need to match!
// const weatherData = {
// 	current: {
// 		time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
// 		isDay: current.variables(0)!.value(),
// 		weatherCode: current.variables(1)!.value(),
// 	},
// 	hourly: {
// 		time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
// 			(t) => new Date((t + utcOffsetSeconds) * 1000)
// 		),
// 		temperature2m: hourly.variables(0)!.valuesArray()!,
// 		apparentTemperature: hourly.variables(1)!.valuesArray()!,
// 		precipitationProbability: hourly.variables(2)!.valuesArray()!,
// 		precipitation: hourly.variables(3)!.valuesArray()!,
// 		rain: hourly.variables(4)!.valuesArray()!,
// 		showers: hourly.variables(5)!.valuesArray()!,
// 		snowfall: hourly.variables(6)!.valuesArray()!,
// 		weatherCode: hourly.variables(7)!.valuesArray()!,
// 	},
// };
//
// // `weatherData` now contains a simple structure with arrays for datetime and weather data
// for (let i = 0; i < weatherData.hourly.time.length; i++) {
// 	console.log(
// 		"Time: ",
// 		weatherData.hourly.time[i].toISOString(),
// 		", Temp: ",
// 		weatherData.hourly.temperature2m[i], // air temp at 2m in Celcius
// 		", Apparent Temp: ",
// 		weatherData.hourly.apparentTemperature[i], // feels like
// 		", Precept prob: ",
// 		weatherData.hourly.precipitationProbability[i], // Probability of precipitation with more than 0.1 mm of the preceding hour- so hour before!.
// 		", Precept: ",
// 		weatherData.hourly.precipitation[i], // mm, Total precipitation (rain, showers, snow) sum of the preceding hour
// 		", Rain: ",
// 		weatherData.hourly.rain[i], // mm, Rain from large scale weather systems of the preceding hour in millimeter
// 		", Showers: ",
// 		weatherData.hourly.showers[i], // short lived, Showers from convective precipitation in millimeters from the preceding hour
// 		", Snowfall: ",
// 		weatherData.hourly.snowfall[i], // cm, Snowfall amount of the preceding hour in centimeters. For the water equivalent in millimeter, divide by 7. E.g. 7 cm snow = 10 mm precipitation water equivalent
// 		", Weather code: ",
// 		weatherData.hourly.weatherCode[i] // right now, see weather codes
// 	);
// 	const weatherElement = document.getElementById('weather');
// 	if(weatherElement != null) {
// 		//weatherElement.innerHTML = weatherData.hourly.precipitationProbability[i].toString();
//
// 		(document.getElementById('amWeatherIcon') as HTMLImageElement).src = cloudImage;
//
// //		const imgElement = document.createElement('img');
// //		imgElement.src = cloudImage;
// //		weatherElement.innerHTML.body.appendChild(imgElement);
// //		amWeatherIcon = document.getElementById()
// 	}
// }
//
// //if (weatherData != null) {
// //	const weatherElement = document.getElementById('weather')
// //	if(weatherElement != null) {
// //		weatherElement.innerHTML = weatherData.current.isDay.toString();
// //	}
// //}
//
// // `weatherData` now contains a simple structure with arrays for datetime and weather data
