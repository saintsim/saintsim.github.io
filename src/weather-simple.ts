import cloudImage from '../public/assets/images/icon-cloud-64.png';
function getWeatherData() {
    (document.getElementById('amWeatherIcon') as HTMLImageElement).src = cloudImage;

    var xhr = new XMLHttpRequest();
    var url = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m";

    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            console.log(response);
            // You can process the weather data here
            document.getElementById("weather").textContent = "Temperature: " +
                response.hourly.temperature_2m[0] + "°C";
        } else if (xhr.readyState === 4) {
            console.error("Failed to fetch weather data.");
        }
    };
    xhr.send();
}

getWeatherData();