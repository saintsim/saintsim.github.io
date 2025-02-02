import { isTodayAWeekday } from './date'

// dates added on 02Feb2025 (https://tokyo-brt.co.jp/bus-stops/b02-kachidoki-brt/)
const brtKachidokiToToranomonBusTimes: BusSchedule = {
    6: [31, 51],
    7: [12, 32, 51],
    8: [13, 21, 33, 41, 53],
    9: [13, 33, 54],
    10: [13, 33, 56],
    11: [13, 33, 56],
    12: [13, 33, 54],
    13: [13, 35, 53],
    14: [13, 33, 53],
    15: [13, 33, 57],
    16: [16, 33, 53]
    // don't expect to take thus bus after this
};

const brtToranomonToKachidokiBusTimes: BusSchedule = {
    // don't expect to use a bus earlier than this
    12: [15, 33, 53],
    13: [15, 32, 53],
    14: [15, 32, 52],
    15: [15, 32, 52],
    16: [15, 32, 52],
    17: [15, 32, 52],
    18: [13, 23, 35, 45, 55],
    19: [14, 34, 50],
    20: [11, 30, 50],
    21: [10, 50],
    22: [11]
};

type BusSchedule = {
    [hour: number]: number[];
};

type BusTime = {
    hour: number;
    minute: number;
    time: Date;
};

type NextBusResult = {
    nextBus: string;
    waitTime: number;
};

function findNextBus(hour: number, minute: number, schedule: BusSchedule): NextBusResult {
    const currentTime: Date = new Date();
    // Convert schedule into sorted array of all times
    const allBusTimes: BusTime[] = Object.entries(schedule).flatMap(([h, minutes]) => {
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
        if (bus.hour > hour) return true;
        if (bus.hour === hour && bus.minute > minute) return true;
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

function setElementBlock(id: string, data: any) {
    const currentElement = document.getElementById(id);
    if (currentElement) {
        currentElement.textContent = data;
    }
}

export function getNextTwoBusTimes() {
    // check are we a week day
    if (isTodayAWeekday()) {
        let now:Date = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        let nextBus: NextBusResult;
        let nextNextBus: NextBusResult;

        if (currentHour < 14) {
            // assumes I'm taking the bus from home
            nextBus = findNextBus(currentHour, currentMinute, brtKachidokiToToranomonBusTimes);
            if (nextBus.nextBus.includes(":")) {
                const busTime:string[] = nextBus.nextBus.split(":")
                nextNextBus = findNextBus(Number(busTime[0]), Number(busTime[1]), brtKachidokiToToranomonBusTimes);
            } else {
                nextNextBus = nextBus
            }
            setElementBlock("nextBusRoute", "Next bus to Toranomon:");
        } else {
            // assumes I'm taking bus back from work
            nextBus = findNextBus(currentHour, currentMinute, brtToranomonToKachidokiBusTimes);
            if (nextBus.nextBus.includes(":")) {
                const busTime:string[] = nextBus.nextBus.split(":")
                nextNextBus = findNextBus(Number(busTime[0]), Number
                    (busTime[1]), brtToranomonToKachidokiBusTimes);
            } else {
                nextNextBus = nextBus
            }
            setElementBlock("nextBusRoute", "Next bus to Kachidoki:");
        }
        setElementBlock("nextBus", nextBus.nextBus);
        setElementBlock("nextNextBus", nextNextBus.nextBus);
    } else {
        // no bus needed today
    }
}

getNextTwoBusTimes();
setInterval(getNextTwoBusTimes, 600000); // refresh every 10mins