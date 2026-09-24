// Weekday Tokyo BRT timetables used by bus.ts.
// Regenerate with `npm run scrape:brt` (also run weekly by .github/workflows/scrape-brt.yml).
// Hand edits are fine, but the next scrape that finds a change will overwrite them.

export type BusSchedule = {
    [hour: number]: number[];
};

export const scheduleSource = {
    scrapedAt: "2026-03-14",
    kachidoki: "https://www.tokyo-brt.co.jp/bus-stops/b02-kachidoki-brt",
    toranomon: "https://www.tokyo-brt.co.jp/bus-stops/b11-toranomon-hills"
};

// Kachidoki BRT -> Toranomon Hills (Toranomon-bound departures only, not the Shimbashi ones)
export const brtKachidokiToToranomonBusTimes: BusSchedule = {
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
};

// Toranomon Hills -> Kachidoki BRT (every departure)
export const brtToranomonToKachidokiBusTimes: BusSchedule = {
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
