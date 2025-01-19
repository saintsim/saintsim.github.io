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

const cloudImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAANTklEQVR4nO1aW2xU1xUdpWpTVWqlqupXpaSJ1H42Un+b3/72o1IqtWob9Sc0MS9jY8BvG0ywIbGNeTmQYB4hNgkQHgnv8EiaYAdCwts2mDH2eOx5v2f8ml2tc9ceH7soBgIpieZIWzNz5869d6+99tr7nDMuV37kR37kR37kR37kR37kR37kx7c0ytzpZ6qGxv5d5R1rq/SOX6oeHvdUD4+naobHk1XD43cqveNfVHjG2soGR/+Fc13fh1El8kSVZ/Rv1d7xM7UjE9k6f1ZWBkReDYis4qsajq8IiCz3Z6VmZCJbPjT2UflA5s8viPzA9V0cNcPpP9YMjV2C03C2ISCyOiSyJijyWkjktaDI6yHH1gSc4zhnVVDkVb/ICr9IrW9Syj1jl5f0p553fVdGc488WT2YaVk+PJ6th9NBx7nGkEhTUGRtSKQlLNKC15Dz2VhYpAmA8Px6smK5X6RyaDxbPpDZUCXyI9fjPJYORn9R6810rQpkjeOIbjOcDousC4usD4tsCItsDItsijhm3vP4eoLSHHIAAzPqgyJ1AbAhK6WDmdO4h+txHMuGYr9cPpT5CjQGvZsYWTgNJ1vDIm9ERDZHRN4Mi7wZmbItOI7vLTDWEQgwoiE4xYbywdGrS/sjP3c9TqNV5Ie13vTHcP71gOM8HNhIp7bQ6baoyLaIY9stw+e2iMhbOC8qsjnkAAHwAGJjUGQ1xdJhQvrMvB550vW4jNqB1LqGQNahPKMOB0y04TRtR1RkZ1RkFyw2ZW/D+L0NRCvZYIOwkiCU9adaXI/DqOqPPb/SO5aFsiPXN4ScB4fzWxFhy+l3YiIdcZHdMZF3LcPnjpjIO/EpILYRhDfIJAWhgZpQ4RmbXHYz9of/r/MiT9R5Uheh2mspYq3MaURSIw7HdydE3ouL7ImL7E2I7EuI7I1PGY6/G58CYidBABsAgjIBmgBhhB6UDaQu4Rm+NYfL+xLPVdyOrasZTF1bMZRO1HnTqTWByVzOQ9VN5KNO5EHtdkSZDsLp/QmRAwmRg7C4yAEYj+/jebvjzu/ABmjEW2AC06GZ1QGpUDMyIYv7on965I7P65Eny27HW2uHRieN0LFMmagj3xH56JTzO5jb6jwi/H5c5GBS5FBS5IOkyOGUyJGUyOGkyIc8ju8PJKcDgeuADW28PtKhOew0TWiWlvYnTjxy58vd8TMrfZOmQcHNVeGR61vCIltjjiHqmvNw/j1SfX/ccRDOHk2JHE2KHE9Nt6P8DmB8gN/EnN/iGu28Zhu0hamGADT4RWq8Y9mSvmjdI2uSSm9H36hT54OOyG0mLdXZnRGRnczddkZtN3Md1M45nxQ5kRY5mRL5KCVyyjIcO5kWOZYUOUKWIDXeBwi4Nu8FYW0lCGAiWufqkUlZ4k58VXQ19PRDdX5JX+i5Sk9msoHOo7ShnqOkwWE4a1Q9SjWnkEHw9vDhDyVEPkyJHKODcPx0WuRsWuTjtMgneE05n08DmDQZATZQKwwTmFI7FASkIEpj0EmFar9IyZ3kUPGt0O8eGgAlveH1EBsgvT7o0H07VR0OI1f30VGj5rHpyo7oI5LI9eNJx/kzdPqTjMhntP/ACIgBgSkCxhgQqCEol7u0REYcUcT8Ag0SQKjyiyzuTw4V3Qg/nOl0qTtxHSWnidGHwIGKe1TUGGFQVemK43iF8wdJ/WOM7Gk6CYfPpUW6MiJdaZHOtMinBAHgACScfwJCSU3A9feSZW+TBZs4d1htT5xGsrKoL/pV1ZWHoAmVd5Ix0H8t8x7R72DkDyemaIoow1kAgrJmnKcBgON0CI7ByXN0/ELGsc8BAkDJOACczThgnQR4YBCBhpiilwAD8SxolFCFGjFpIguqfSKl3glZ2Bta9Y0BKHcn4goAmhvkH6iPKOOhjlkA5MoY67qy4wiF7xTz/lM6+nlG5Asa3nfx+KfpKRBOATyAkJhKhX3UHQgihBjMhD6Z3gBVwSdS4RMp6U+OLeyOPPvAzi+5FXqqzB0PYhEDZQ85t5MAmLIWdx5Ky5ZJg6Tz3X4q+CHmvwEg49BfAeii4+f52mkBgBQBAGAMqsNxmwXsKHex58AMEwHCDLTe0oKy4awU9oQ2P5DzC2/4/7HUnYhh0gFkN1D9AQBycF+MDqrRYUTH6IBWADY8EDQIoM0AOPz5qGOdCkCaDEg5YBktAIDUEQB+IOZoUDvTAKm5zposYZ5Q43dYUHw7EX/pvOcn9+X8/Kv+ktLBdLbW51AKFcAAQAZ0aIPDSGtru5/Kb7o4AMCUAAAqgogq6P2ZBULOeVQEfgcGAICzVo+ANDjMbhL36eCkCc+1XtOAFQHPXjkisswzJguu+f56z84vuDzyz6UD6SyEBKqK/AcAG9n44IboyuzeHpHeZ09wSNG9BEbLIHoAOPMxQUCktQyayGtJpFAqAGfIHqQByuIh3hMlEXMNTJZ0ooQ0wPpjLcWw3Cey8Jpv073R/tLws0V98RiQq/M7F4Lza9n2ao+Pbg8sAAhmdgdKIipsfnAMTYsplWQBdOI4QQCtz7IP+ITR1hKo/YBhAFMG55+GkAIAAMpSi/trZwghbNGZIsuhArCoN9x1b9G/5u+oGMkaFQWNML83rS97fiC9HahHnPzr0K7P6v5289UwxO4G2Q+csPoBpINhAxmhzREcN2YxAACABSiJH1hNkakEfD7VAZ0kqQ4suhX13FP0S9yJCagn1ubR/OBiZorL/G9jCqATMwBYrbCZ75MZBgCapoLpCNnUoCdATp9i13eGkdbWWN/DeTWtBmCASQEuohgN4OoTnrVJK0FgqhwW98VSswIw98pQRdnwpPkR6I/+GvPuDdbKztuW4ybqfAgcU0YoAO266kN2AISDKYe+RyiKYAMaHbS9OiECIAYUgnOaAGgKHGF/ARFs51qBDUDjXQGIZman//XAiUqfyHLQ3+80FcgptJqI/g62wDq3N6JHDTCRZ1nqgPPKDAUlPkMUuQagU+JpQKDsWaCA9nhvyiB7DtMNWnMCzE90yUw1YFoK3Az7ZgWg8GbYU+Uj/bms3cLlLY0+HILg4QEOMA8NCFY6QCBzi50JR6V11qiVQ+cIRhfYKR4lK5DjMCg+gAFA2gqb6THvCVB3sDKBofZK0aszRLCwJzi7CBbdiqRN/vud/H9dAQhPAWBmfzEnB03nRxAQ3Q57dRdO4wFZNSCcpnrYS2NWu4xrocEBGDq/ACgwc8xeIGHa4V66XqgC2KSTImypWQAsuDz81qwALOoNx+8GwKa7ARDnA9ERANDOSBuHQc24SBtWiaDSKqAEp13LJCvEtDVCipyZW+A9gcJ5e3TBFPeg87pEZtPfAGA1Qi9fHPj7rAAsvBG8OTMF1loVwDRA6AAJgqE/a/1uPhQc3IbGhJOULaSnMQKxjUDtssooukrog2pLzljv9+pqMafBABhB2Wyrv9Lf79A/l/+94eTi6/6fzgrAgisj/yOCpgqEnMlGm1UF3iUQuSVsrg4hKog4HIZ25Pb78IrPAMVaNDV7BQSv3a4s1vK4ARerywxCG53HdczOETdiXpsRfbC51Dspcy952lz3Ml758k5RmXciVwZNC0wWgGJQWuRcbleHVSG3iaFRp/NwHDvAzWqcUZqmig6AWfgdNMKsK1qgYKa3k9fezgBs5W/syCv1G6zoI/cd9Q+Nzr868Jt7AmDuOfczxTcjuUYIC41gARqLFq4G4aENja29PRMRNiOIPPYFEG3sBOvG5houXprtcTw4zwEQYNcWLmxspek1VT/eZADguG6VrZ/h/EqlPnLfJ7JsaFxeuXCn0XU/o+DLwR3l2gyxGzS7vBTEjSyLutlpjJufOL6RdEfk4SxaaTBptWXmzxHcOcY14cgGAqzb5HqPVr7XdML3ANZsn5OheEaNPJQfOlY+kpV5V7xdL566/eP7AuCVC31PF3YH41BPXBCpUE8maDrM3ONXp0FHON5k7evrvz3qaQ2WAQwAhPN1G10BMWbdB5+V7ub6BHJm5I3zPpH510cG51y88yvXg4y55/tfKO6LTeJiBgQ60WABAWrnDNFkxEFzRFcdx3Ra/w9k/hMUnG4GXP4G1ki2NVvANPM47ott99V6fXZ7ELxq0h6Rh/MF592/d32T8fIFdwlAABOALDQBbADVoLQGDP7XB41HA4+tYkQAGsAzv7Ns5V1MganXFCF7VqvhOFOpnufjWVCtUOqgWRXM+XlXPF0PHPmZY05n318KbwTi0ATcBEDgpiuIPB7COMH3cBDfIQ9raHgPIBSMrzVcz7qm/oPMMMm6h7k2mxw4jlJX2BMYfbmzr/G+c3628dL5W08VfNG/vag3NFE6NG5ohtQAIMZIP/2M78053KWpngHG11mNZcvBoMD076p5vwrm+dLBjBTeCCQLLri3FXTe+q3rUY45F2//ek5Xb3HBxcGT8y4P9y647k8UdgdloWX4vKg7KEXdQSnuDspiWkmPY0tmMT1Pf7eY1ymiFXb7Rxdc8/nnX/GeL7jg3vpS580X553r+dkjdTw/8iM/8iM/8iM/8iM/XN+/8V9zJGXm8W04vQAAAABJRU5ErkJggg==";

function getWeatherData() {
    document.getElementById('amWeatherIcon').src = cloudImage;
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
        }
        else if (xhr.readyState === 4) {
            console.error("Failed to fetch weather data.");
        }
    };
    xhr.send();
}
getWeatherData();
