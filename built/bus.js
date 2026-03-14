import { isTodayAWeekday } from './date';
// dates updated on 6March2026 (https://tokyo-brt.co.jp/bus-stops/b02-kachidoki-brt/)
const brtKachidokiToToranomonBusTimes = {
    6: [31, 46],
    7: [6, 26, 36, 42, 53],
    8: [1, 11, 16, 22, 31, 40, 50],
    9: [6, 21, 46, 56],
    10: [16, 31, 51],
    11: [6, 26, 46],
    12: [1, 16, 39, 51],
    13: [11, 26, 46],
    14: [1, 21, 36, 56],
    15: [11, 33, 46],
    16: [6, 21, 41, 56]
    // don't expect to take thus bus after this
};
const brtToranomonToKachidokiBusTimes = {
    // don't expect to use a bus earlier than this (update on 14March2026- https://tokyo-brt.co.jp/bus-stops/b11-toranomon-hills)
    12: [5, 25, 40],
    13: [0, 15, 35, 50],
    14: [10, 25, 45],
    15: [0, 20, 35, 55],
    16: [10, 30, 45],
    17: [5, 20, 40, 55],
    18: [15, 30, 50],
    19: [0, 20, 35, 50],
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
