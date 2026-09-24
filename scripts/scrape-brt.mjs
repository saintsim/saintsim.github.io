#!/usr/bin/env node
// Scrapes the weekday Tokyo BRT timetables for the two stops used by src/bus.ts and
// rewrites src/bus-schedule.ts. It exits non-zero instead of writing anything it isn't
// sure about, so a site redesign fails the workflow rather than shipping a bad timetable.
//
//   node scripts/scrape-brt.mjs            scrape and rewrite src/bus-schedule.ts
//   node scripts/scrape-brt.mjs --dry-run  scrape and print, write nothing
//
// Env overrides, for when the site changes how it marks departures:
//   BRT_TORANOMON_MARK  the mark used on Toranomon Hills-bound departures at Kachidoki
//   BRT_DEBUG_DIR       write each page's raw HTML and extracted text here

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const STOPS = {
    kachidoki: 'https://www.tokyo-brt.co.jp/bus-stops/b02-kachidoki-brt',
    toranomon: 'https://www.tokyo-brt.co.jp/bus-stops/b11-toranomon-hills'
};
const OUTPUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'bus-schedule.ts');
const DRY_RUN = process.argv.includes('--dry-run');
const DEBUG_DIR = process.env.BRT_DEBUG_DIR;

const WEEKDAY = /平日|weekday/i;
const TORANOMON = /虎ノ門ヒルズ|虎ノ門|toranomon/i;
const KACHIDOKI_BOUND = /勝どき|晴海|豊洲|有明|東京ビッグサイト|国際展示場|kachidoki|harumi|toyosu/i;

async function fetchPage(url) {
    const res = await fetch(url, { headers: { 'User-Agent': 'saintsim.github.io timetable scraper', 'Accept-Language': 'ja' } });
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    return res.text();
}

// Flatten HTML to text lines, one per table row / block, keeping image alt text
// and class names of empty elements (icons) as marks, since either may be how
// the site flags a departure's destination.
function htmlToLines(html) {
    const text = html
        .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<img[^>]*\balt="([^"]*)"[^>]*>/gi, ' $1 ')
        .replace(/<(\w+)[^>]*\bclass="([^"]*)"[^>]*>\s*<\/\1>/gi, ' [$2] ')
        .replace(/<\/(tr|p|div|li|h\d|dt|dd|table|thead|tbody|section|caption)>|<br\s*\/?>/gi, '\n')
        .replace(/<\/(td|th)>/gi, ' ')
        // inline tags often wrap just the mark ("<span>虎</span>31"), so drop them without a gap
        .replace(/<\/?(span|a|b|strong|em|i|sup|sub|small|font)\b[^>]*>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
    return text.split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

// A timetable row is an hour (5-25, optionally followed by 時) then minute tokens,
// each of which may carry a non-digit mark before or after it.
const ROW = /^(\d{1,2})\s*時?\s+(.*\d.*)$/;
const MINUTE = /([^\d\s]*)(\d{1,2})([^\d\s]*)/g;

function parseRow(line) {
    const m = line.match(ROW);
    if (!m) return null;
    const hour = Number(m[1]);
    if (hour < 4 || hour > 25) return null;
    const departures = [];
    for (const [, pre, min, post] of m[2].matchAll(MINUTE)) {
        const minute = Number(min);
        if (minute > 59) return null;
        departures.push({ minute, mark: (pre + post).replace(/[()（）]/g, '') });
    }
    return departures.length ? { hour, departures } : null;
}

// Split the page into timetables: a run of consecutive rows, labelled by the
// non-row lines seen since the previous timetable ended (tabs, headings, captions).
function findTimetables(lines) {
    const tables = [];
    let heading = [];
    let current = null;
    for (const line of lines) {
        const row = parseRow(line);
        if (row) {
            if (!current || row.hour <= current.rows.at(-1).hour) {
                current = { heading: heading.join(' / '), rows: [] };
                tables.push(current);
                heading = [];
            }
            current.rows.push(row);
        } else {
            current = null;
            heading.push(line);
            if (heading.length > 8) heading.shift();
        }
    }
    return tables.filter(t => t.rows.length >= 5);
}

function weekdayTables(tables) {
    const weekday = tables.filter(t => WEEKDAY.test(t.heading));
    if (weekday.length) return weekday;
    // No labels: sites usually list weekday first, so take the first table only.
    return tables.slice(0, 1);
}

function pickOne(tables, stop, preferred) {
    const candidates = preferred ? tables.filter(t => preferred.test(t.heading)) : [];
    const pool = candidates.length ? candidates : tables;
    if (pool.length !== 1) {
        throw new Error(`${stop}: expected one weekday timetable, found ${pool.length}:\n` +
            pool.map(t => `  - "${t.heading}" (${t.rows.length} hours)`).join('\n'));
    }
    return pool[0];
}

function findToranomonMark(lines, marks) {
    if (process.env.BRT_TORANOMON_MARK) return process.env.BRT_TORANOMON_MARK;
    const found = [...marks].filter(mark =>
        TORANOMON.test(mark) ||
        lines.some(l => {
            const i = l.indexOf(mark);
            return i !== -1 && TORANOMON.test(l.slice(i, i + mark.length + 15)) && !parseRow(l);
        }));
    if (found.length !== 1) {
        throw new Error(`kachidoki: can't tell which mark means Toranomon Hills. Marks on the weekday ` +
            `timetable: ${JSON.stringify([...marks])}, matched legend: ${JSON.stringify(found)}. ` +
            `Set BRT_TORANOMON_MARK to the right one.`);
    }
    return found[0];
}

function toSchedule(rows, keep = () => true) {
    const schedule = {};
    for (const { hour, departures } of rows) {
        const minutes = departures.filter(keep).map(d => d.minute);
        if (minutes.length) schedule[hour] = [...new Set(minutes)].sort((a, b) => a - b);
    }
    return schedule;
}

function count(schedule) {
    return Object.values(schedule).reduce((n, m) => n + m.length, 0);
}

async function scrape(stop) {
    const html = await fetchPage(STOPS[stop]);
    const lines = htmlToLines(html);
    if (DEBUG_DIR) {
        await mkdir(DEBUG_DIR, { recursive: true });
        await writeFile(path.join(DEBUG_DIR, `${stop}.html`), html);
        await writeFile(path.join(DEBUG_DIR, `${stop}.txt`), lines.join('\n'));
    }
    const tables = findTimetables(lines);
    console.log(`${stop}: ${tables.length} timetable(s): ${tables.map(t => `"${t.heading}"`).join(', ')}`);
    return { lines, weekday: weekdayTables(tables) };
}

function formatSchedule(schedule) {
    return '{\n' + Object.entries(schedule)
        .map(([h, m]) => `    ${h}: [${m.join(', ')}]`)
        .join(',\n') + '\n}';
}

async function main() {
    const kachidoki = await scrape('kachidoki');
    const toranomon = await scrape('toranomon');

    // At Kachidoki both Shimbashi and Toranomon Hills buses share a timetable; only the marked ones go to Toranomon.
    const outbound = pickOne(kachidoki.weekday, 'kachidoki', TORANOMON);
    const marks = new Set(outbound.rows.flatMap(r => r.departures.map(d => d.mark)).filter(Boolean));
    const mark = findToranomonMark(kachidoki.lines, marks);
    const toToranomon = toSchedule(outbound.rows, d => d.mark === mark);

    // Coming home, any bus from Toranomon Hills passes Kachidoki.
    const inbound = pickOne(toranomon.weekday, 'toranomon', KACHIDOKI_BOUND);
    const toKachidoki = toSchedule(inbound.rows);

    const allOutbound = count(toSchedule(outbound.rows));
    console.log(`Kachidoki -> Toranomon: ${count(toToranomon)} of ${allOutbound} departures (mark "${mark}")`);
    console.log(`Toranomon -> Kachidoki: ${count(toKachidoki)} departures`);
    if (count(toToranomon) < 10 || count(toToranomon) === allOutbound || count(toKachidoki) < 10) {
        throw new Error('Scraped timetables look wrong (too few departures, or no Shimbashi buses filtered out); not writing.');
    }

    const today = new Date().toISOString().slice(0, 10);
    const source = `// Weekday Tokyo BRT timetables used by bus.ts.
// Regenerate with \`npm run scrape:brt\` (also run weekly by .github/workflows/scrape-brt.yml).
// Hand edits are fine, but the next scrape that finds a change will overwrite them.

export type BusSchedule = {
    [hour: number]: number[];
};

export const scheduleSource = {
    scrapedAt: "${today}",
    kachidoki: "${STOPS.kachidoki}",
    toranomon: "${STOPS.toranomon}"
};

// Kachidoki BRT -> Toranomon Hills (Toranomon-bound departures only, not the Shimbashi ones)
export const brtKachidokiToToranomonBusTimes: BusSchedule = ${formatSchedule(toToranomon)};

// Toranomon Hills -> Kachidoki BRT (every departure)
export const brtToranomonToKachidokiBusTimes: BusSchedule = ${formatSchedule(toKachidoki)};
`;
    const withoutDate = s => s.replace(/scrapedAt: ".*"/, '');
    const existing = await readFile(OUTPUT, 'utf8').catch(() => '');
    if (DRY_RUN) {
        console.log(source);
    } else if (withoutDate(existing) === withoutDate(source)) {
        console.log('Timetables unchanged.');
    } else {
        await writeFile(OUTPUT, source);
        console.log(`Wrote ${path.relative(process.cwd(), OUTPUT)}`);
    }
}

main().catch(err => {
    console.error(err.message ?? err);
    process.exit(1);
});
