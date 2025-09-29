import { isTodayAWeekday } from './date';
// dates updated on 30Sep2025 (https://tokyo-brt.co.jp/bus-stops/b02-kachidoki-brt/)
const brtKachidokiToToranomonBusTimes = {
    6: [31, 51],
    7: [1, 12, 22, 32, 42, 51],
    8: [2, 11, 23, 31, 43, 51],
    9: [11, 31, 51],
    10: [11, 31, 51],
    11: [11, 31, 51],
    12: [11, 31, 51],
    13: [11, 31, 51],
    14: [11, 31, 51],
    15: [11, 31, 51],
    16: [11, 31, 51]
    // don't expect to take thus bus after this
};
const brtToranomonToKachidokiBusTimes = {
    // don't expect to use a bus earlier than this
    12: [10, 30, 50],
    13: [10, 30, 50],
    14: [10, 30, 50],
    15: [10, 30, 50],
    16: [10, 30, 50],
    17: [10, 30, 50],
    18: [10, 30, 50],
    19: [10, 30, 50],
    20: [10, 30, 50],
    21: [10, 30, 50],
    22: [10, 32]
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
