const zeroFill = (n: number) => ('0' + n).slice(-2);

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getOrdinal(n: number) {
    const ord = ["st", "nd", "rd"];
    const exceptions = [11, 12, 13];
    if (exceptions.includes(n % 100)) {
        return n + "th";
    }
    const suffix = ord[(n % 10) - 1] || "th";
    return n + suffix;
}

function updateDate() {
    let now:Date = new Date();
    const currentDayOfWeek = daysOfWeek[now.getDay()];
    const dayOfMonth = getOrdinal(now.getDate());
    const month = now.toLocaleString('default', { month: 'long' });
    const dateElement = document.getElementById('date');
    if (dateElement) {
        dateElement.innerHTML = `${currentDayOfWeek} ${dayOfMonth} ${month}`;
    }
}

function updateTime() {
    let now:Date = new Date();
    const dateTime = zeroFill(now.getHours()) + ':' + zeroFill(now.getMinutes()) + ':' + zeroFill(now.getSeconds());
    const timeElement = document.getElementById('time');
    if (timeElement) {
        timeElement.innerHTML = dateTime;
    }
}

function scheduleUpdateDate() {
    updateDate();
    let now:Date = new Date();
    const timeToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    setTimeout(() => {
        updateDate();
        setInterval(updateDate, 24 * 60 * 60 * 1000); // Update every 24 hours
    }, timeToMidnight);
}

// used by the bus module
export function isTodayAWeekday(): boolean {
    let now:Date = new Date();
    const currentDayOfWeek = daysOfWeek[now.getDay()];
    return currentDayOfWeek != "Saturday" && currentDayOfWeek !== "Sunday";
}

scheduleUpdateDate();
setInterval(updateTime, 1000); // every 1 second