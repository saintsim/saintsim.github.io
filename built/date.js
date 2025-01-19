const zeroFill = n => {
    return ('0' + n).slice(-2);
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getOrdinal(n) {
    let ord = ["st", "nd", "rd"]
    let exceptions = [11, 12, 13]
    let nth = ord[(n % 10) - 1] === undefined || exceptions.includes(n % 100) ? "th" : ord[(n % 10) - 1]
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