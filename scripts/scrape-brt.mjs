#!/usr/bin/env node
// Scrapes the weekday Tokyo BRT timetables for the two stops used by src/bus.ts and
// rewrites src/bus-schedule.ts. It exits non-zero instead of writing anything it isn't
// sure about, so a site redesign fails the workflow rather than shipping a bad timetable.
//
//   node scripts/scrape-brt.mjs            scrape and rewrite src/bus-schedule.ts
//   node scripts/scrape-brt.mjs --dry-run  scrape and print, write nothing
//
// Page structure (see scripts/fixtures/NOTES.md): each direction is a CSS tab,
// <label class="tab" for="tabN"> naming the destinations, with its timetables in
// <div class="tabItem" id="tabItemN">. The weekday one is <table class="table-tt weekday">,
// one <tr> per hour, one <div class="item"> per departure holding <div class="time">
// and <div class="sub"> destination marks explained by the tab's legend <p>s.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const STOPS = {
    kachidoki: 'https://www.tokyo-brt.co.jp/bus-stops/b02-kachidoki-brt',
    toranomon: 'https://www.tokyo-brt.co.jp/bus-stops/b11-toranomon-hills'
};
// Every bus leaving Toranomon Hills (the terminus) goes through Kachidoki BRT to one of these.
// A legend naming anywhere else means a new route we haven't checked, so fail rather than guess.
const SOUTHBOUND_DESTINATIONS = /晴海|豊洲|国際展示場|東京テレポート|ミチノテラス/;
const OUTPUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'bus-schedule.ts');

function text(html) {
    return html
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replace(/\s+/g, ' ')
        .trim();
}

// Returns one entry per direction tab: its label, legend lines and weekday departures.
export function parseStop(html) {
    html = html.replace(/<!--[\s\S]*?-->/g, ''); // commented-out legends name marks the tables don't use
    const labels = new Map(
        [...html.matchAll(/<label[^>]*class="tab"[^>]*for="tab(\d+)"[^>]*>([\s\S]*?)<\/label>/gi)]
            .map(([, n, label]) => [n, text(label).replace(/印刷$/, '').trim()]));
    const starts = [...html.matchAll(/<div class="tabItem" id="tabItem(\d+)">/gi)];
    return starts.map((start, i) => {
        const body = html.slice(start.index, starts[i + 1]?.index ?? html.length);
        const table = body.match(/<table class="table-tt weekday">([\s\S]*?)<\/table>/i);
        if (!table) throw new Error(`tabItem${start[1]}: no weekday timetable`);
        const departures = [];
        for (const [, hour, cells] of table[1].matchAll(/<tr>\s*<th[^>]*>\s*(\d+)\s*<\/th>([\s\S]*?)<\/tr>/gi)) {
            for (const item of cells.split(/<div class="item">/i).slice(1)) {
                const time = text(item.match(/<div class="time[^"]*">([\s\S]*?)<\/div>/i)?.[1] ?? '');
                if (!time) continue; // hours with no service still emit an empty item
                if (!/^\d{1,2}$/.test(time) || Number(time) > 59) throw new Error(`tabItem${start[1]}: bad minute "${time}" at ${hour}時`);
                const mark = [...item.matchAll(/<div class="sub">([\s\S]*?)<\/div>/gi)].map(m => text(m[1])).join('');
                departures.push({ hour: Number(hour), minute: Number(time), mark });
            }
        }
        const legend = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => text(m[1])).filter(l => l.includes('：'));
        return { label: labels.get(start[1]) ?? '', legend, departures };
    });
}

// Kachidoki: the Shimbashi/Toranomon Hills tab mixes both destinations; keep only departures
// carrying the mark the legend says means Toranomon Hills (unmarked ones stop at Shimbashi).
export function kachidokiToToranomon(html) {
    const tabs = parseStop(html).filter(t => t.label.includes('虎ノ門ヒルズ'));
    if (tabs.length !== 1) throw new Error(`kachidoki: expected one Toranomon Hills tab, found ${tabs.length}`);
    const [tab] = tabs;
    const legend = tab.legend.filter(l => l.includes('虎ノ門ヒルズ'));
    if (legend.length !== 1) throw new Error(`kachidoki: expected one Toranomon Hills legend line, found ${JSON.stringify(tab.legend)}`);
    const mark = legend[0].split('：')[0].trim();
    const toranomon = tab.departures.filter(d => d.mark === mark);
    if (!toranomon.length || toranomon.length === tab.departures.length) {
        throw new Error(`kachidoki: mark "${mark}" matched ${toranomon.length} of ${tab.departures.length} departures; expected some but not all`);
    }
    return toSchedule(toranomon);
}

// Toranomon Hills is the terminus, so every departure heads south through Kachidoki,
// as long as every destination in the legend is one we know is past Kachidoki.
export function toranomonToKachidoki(html) {
    const tabs = parseStop(html);
    if (!tabs.length) throw new Error('toranomon: no timetable tabs');
    for (const tab of tabs) {
        const unknown = tab.legend.filter(l => !SOUTHBOUND_DESTINATIONS.test(l));
        if (!tab.legend.length || unknown.length) {
            throw new Error(`toranomon: legend has destinations not known to pass Kachidoki: ${JSON.stringify(unknown.length ? unknown : tab.legend)}`);
        }
        // "無印" (no mark) in a legend explains the unmarked departures
        const marks = new Set(tab.legend.map(l => l.split('：')[0].trim()).map(m => (m === '無印' ? '' : m)));
        const unexplained = [...new Set(tab.departures.map(d => d.mark))].filter(m => !marks.has(m));
        if (unexplained.length) throw new Error(`toranomon: departures marked ${JSON.stringify(unexplained)} aren't in the legend`);
    }
    return toSchedule(tabs.flatMap(t => t.departures));
}

export function timetableAsOf(html) {
    return html.match(/<div class="update"><span class="marker">([^<]*)<\/span>/)?.[1].trim() ?? '';
}

function toSchedule(departures) {
    const schedule = {};
    for (const { hour, minute } of departures) (schedule[hour] ??= new Set()).add(minute);
    return Object.fromEntries(Object.entries(schedule)
        .sort(([a], [b]) => a - b)
        .map(([h, m]) => [h, [...m].sort((a, b) => a - b)]));
}

export function count(schedule) {
    return Object.values(schedule).reduce((n, m) => n + m.length, 0);
}

function formatSchedule(schedule) {
    return '{\n' + Object.entries(schedule)
        .map(([h, m]) => `    ${h}: [${m.join(', ')}]`)
        .join(',\n') + '\n}';
}

// The two dated header lines of the generated module, which the "unchanged" check ignores.
const DATED_LINES = /^\/\/ (Last changed|Timetable as of): .*$/gm;

export function renderScheduleModule({ lastChanged, asOf, toToranomon, toKachidoki }) {
    return `// Weekday Tokyo BRT timetables used by bus.ts.
// Generated by scripts/scrape-brt.mjs (run weekly by .github/workflows/scrape-brt.yml).
// Hand edits are fine, but the next scrape that finds a change will overwrite them.
// Last changed: ${lastChanged}
// Timetable as of: ${asOf.replace(/\s+/g, ' ')}
// Sources: ${STOPS.kachidoki}
//          ${STOPS.toranomon}

export type BusSchedule = {
    [hour: number]: number[];
};

// Kachidoki BRT -> Toranomon Hills (Toranomon-bound departures only, not the Shimbashi ones)
export const brtKachidokiToToranomonBusTimes: BusSchedule = ${formatSchedule(toToranomon)};

// Toranomon Hills -> Kachidoki BRT (every departure)
export const brtToranomonToKachidokiBusTimes: BusSchedule = ${formatSchedule(toKachidoki)};
`;
}

async function fetchPage(url) {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (saintsim.github.io timetable scraper)', 'Accept-Language': 'ja' } });
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    return res.text();
}

async function main() {
    const kachidoki = await fetchPage(STOPS.kachidoki);
    const toranomon = await fetchPage(STOPS.toranomon);
    const toToranomon = kachidokiToToranomon(kachidoki);
    const toKachidoki = toranomonToKachidoki(toranomon);
    console.log(`Kachidoki -> Toranomon Hills: ${count(toToranomon)} weekday departures`);
    console.log(`Toranomon Hills -> Kachidoki: ${count(toKachidoki)} weekday departures`);
    if (count(toToranomon) < 10 || count(toKachidoki) < 10) {
        throw new Error('Too few departures; the page layout has probably changed. Not writing.');
    }

    const source = renderScheduleModule({
        lastChanged: new Date().toISOString().slice(0, 10),
        asOf: timetableAsOf(kachidoki),
        toToranomon,
        toKachidoki
    });
    // Only the timetables matter; a new "as of" date alone isn't worth a change.
    const timetablesOnly = s => s.replace(DATED_LINES, '');
    const existing = await readFile(OUTPUT, 'utf8').catch(() => '');
    if (process.argv.includes('--dry-run')) {
        console.log(source);
    } else if (timetablesOnly(existing) === timetablesOnly(source)) {
        console.log('Timetables unchanged.');
    } else {
        await writeFile(OUTPUT, source);
        console.log(`Wrote ${path.relative(process.cwd(), OUTPUT)}`);
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch(err => {
        console.error(err.message ?? err);
        process.exit(1);
    });
}
