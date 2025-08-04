import { isTodayAWeekday } from './date';
// dates added on 02Feb2025 (https://tokyo-brt.co.jp/bus-stops/b02-kachidoki-brt/)
const brtKachidokiToToranomonBusTimes = {
    6: [31, 51],
    7: [12, 32, 55],
    8: [1, 14, 21, 36, 42, 56],
    9: [13, 33, 55],
    10: [15, 36, 56],
    11: [15, 35, 56],
    12: [13, 35, 57],
    13: [15, 36, 56],
    14: [15, 35, 57],
    15: [15, 35, 55],
    16: [15, 35, 54]
    // don't expect to take thus bus after this
};
const brtToranomonToKachidokiBusTimes = {
    // don't expect to use a bus earlier than this
    12: [14, 32, 54],
    13: [16, 34, 55],
    14: [15, 34, 54],
    15: [16, 34, 54],
    16: [14, 34, 54],
    17: [14, 34, 54],
    18: [11, 34, 54],
    19: [14, 35, 52],
    20: [12, 32, 52],
    21: [12, 52],
    22: [12]
};
function findNextBus(hour, minute, schedule) {
    const currentTime = new Date();
    // Convert schedule into sorted array of all times
    const allBusTimes = Object.entries(schedule).flatMap(([h, minutes]) => {
        const baseTime = new Date(currentTime);
        return minutes.map(m => {
            const busTime = new Date(baseTime);
            busTime.setHours(parseInt(h), m, 0, 0);
            return {
                hour: parseInt(h),
                minute: m,
                time: busTime
            };
        });
    }).sort((a, b) => a.time.getTime() - b.time.getTime());
    // Find the next bus
    const nextBus = allBusTimes.find(bus => {
        if (bus.hour > hour)
            return true;
        if (bus.hour === hour && bus.minute > minute)
            return true;
        return false;
    });
    if (!nextBus) {
        return {
            nextBus: "No more buses today. Check tomorrow's schedule.",
            waitTime: 0
        };
    }
    return {
        nextBus: `${nextBus.hour.toString().padStart(2, '0')}:${nextBus.minute.toString().padStart(2, '0')}`,
        waitTime: Math.round((nextBus.time.getTime() - currentTime.getTime()) / (1000 * 60)) // in minutes
    };
}
function setElementBlock(id, data) {
    const currentElement = document.getElementById(id);
    if (currentElement) {
        currentElement.textContent = data;
    }
}
export function getNextTwoBusTimes() {
    // check are we a week day
    if (isTodayAWeekday()) {
        let now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        let nextBus;
        let nextNextBus;
        if (currentHour < 14) {
            // assumes I'm taking the bus from home
            nextBus = findNextBus(currentHour, currentMinute, brtKachidokiToToranomonBusTimes);
            if (nextBus.nextBus.includes(":")) {
                const busTime = nextBus.nextBus.split(":");
                nextNextBus = findNextBus(Number(busTime[0]), Number(busTime[1]), brtKachidokiToToranomonBusTimes);
            }
            else {
                nextNextBus = nextBus;
            }
            setElementBlock("nextBusRoute", "Next bus to Toranomon:");
        }
        else {
            // assumes I'm taking bus back from work
            nextBus = findNextBus(currentHour, currentMinute, brtToranomonToKachidokiBusTimes);
            if (nextBus.nextBus.includes(":")) {
                const busTime = nextBus.nextBus.split(":");
                nextNextBus = findNextBus(Number(busTime[0]), Number(busTime[1]), brtToranomonToKachidokiBusTimes);
            }
            else {
                nextNextBus = nextBus;
            }
            setElementBlock("nextBusRoute", "Next bus to Kachidoki:");
        }
        setElementBlock("nextBus", `${nextBus.nextBus} (${nextBus.waitTime} mins)`);
        setElementBlock("nextNextBus", `${nextNextBus.nextBus} (${nextNextBus.waitTime} mins)`);
    }
    else {
        // no bus needed today
    }
}
getNextTwoBusTimes();
setInterval(getNextTwoBusTimes, 60000); // refresh every 1min
