// Checks the scraper against saved copies of the stop pages (scripts/fixtures/),
// with expected timetables read off those pages by hand (see NOTES.md).
// Run with `npm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { kachidokiToToranomon, toranomonToKachidoki, parseStop, timetableAsOf, count } from './scrape-brt.mjs';

const fixture = name => readFileSync(new URL(`fixtures/${name}.html`, import.meta.url), 'utf8');
const kachidoki = fixture('b02-kachidoki-brt');
const toranomon = fixture('b11-toranomon-hills');

test('Kachidoki -> Toranomon keeps only the Toranomon Hills (虎) departures', () => {
    assert.deepEqual(kachidokiToToranomon(kachidoki), {
        6: [31, 46],
        7: [7, 28, 38, 42, 54],
        8: [1, 9, 15, 25, 31, 41, 51, 58],
        9: [6, 26, 46],
        10: [1, 16, 31, 51],
        11: [6, 26, 46],
        12: [6, 26, 46],
        13: [6, 26, 45],
        14: [1, 21, 36, 58],
        15: [11, 32, 46],
        16: [6, 21, 41],
        17: [1, 16, 31, 51],
        18: [6, 26, 41],
        19: [1, 15, 33, 50],
        20: [13, 32, 52],
        21: [12, 32, 52],
        22: [14]
    });
});

test('Kachidoki Shimbashi/Toranomon tab has 172 weekday departures, 59 to Toranomon', () => {
    const tab = parseStop(kachidoki).find(t => t.label.includes('虎ノ門ヒルズ'));
    assert.equal(tab.departures.length, 172);
    assert.equal(count(kachidokiToToranomon(kachidoki)), 59);
});

test('Toranomon -> Kachidoki keeps every departure', () => {
    assert.deepEqual(toranomonToKachidoki(toranomon), {
        6: [56],
        7: [11, 26, 48, 59],
        8: [5, 15, 20, 32, 35, 49, 55],
        9: [0, 10, 21, 30, 45],
        10: [5, 20, 40, 55],
        11: [15, 30, 45],
        12: [5, 25, 45],
        13: [5, 25, 45],
        14: [5, 25, 45, 55],
        15: [17, 30, 55],
        16: [10, 30, 45],
        17: [5, 20, 40, 55],
        18: [15, 30, 50],
        19: [0, 20, 35, 50],
        20: [10, 30, 50],
        21: [10, 30, 50],
        22: [10, 32]
    });
});

test('reads the timetable "as of" date', () => {
    assert.equal(timetableAsOf(kachidoki), '2026年09月16日現在');
});

test('fails loudly when the Toranomon legend is missing', () => {
    const noLegend = kachidoki.replace(/：【B11】虎ノ門ヒルズ行/g, '');
    assert.throws(() => kachidokiToToranomon(noLegend), /legend/);
});

test('legends skip commented-out lines and read uppercase <P> tags', () => {
    const [toranomonTab] = parseStop(toranomon);
    assert.deepEqual(toranomonTab.legend, [
        '晴海：【B22】晴海BRTターミナル 止まり',
        '豊洲：【B23】豊洲 止まり',
        'ミチ：【B03】ミチノテラス豊洲 行',
        '国展：【B05】国際展示場 行'
    ]);
    const kachidokiTab = parseStop(kachidoki).find(t => t.label.includes('虎ノ門ヒルズ'));
    assert.deepEqual(kachidokiTab.legend, ['無印：【B01】新橋 止まり', '虎ノ門：【B11】虎ノ門ヒルズ行']);
});

test('fails loudly when Toranomon Hills lists a destination not known to pass Kachidoki', () => {
    const newRoute = toranomon.replace('<p>晴', '<p>新宿：【X01】新宿 行</p><p>晴');
    assert.notEqual(newRoute, toranomon);
    assert.throws(() => toranomonToKachidoki(newRoute), /not known to pass Kachidoki/);
});

test('fails loudly when a Toranomon Hills departure has a mark the legend does not explain', () => {
    const unexplained = toranomon.replace(/<div class="sub">豊<span class="noPrint">洲<\/span><\/div>/, '<div class="sub">謎</div>');
    assert.notEqual(unexplained, toranomon);
    assert.throws(() => toranomonToKachidoki(unexplained), /aren't in the legend/);
});

test('a 無印 legend line explains unmarked Toranomon Hills departures', () => {
    const unmarked = toranomon
        .replace('<p>晴', '<p>無印：【B23】豊洲 止まり</p><p>晴')
        .replace(/<div class="sub">豊<span class="noPrint">洲<\/span><\/div>/, '<div class="sub">&nbsp;</div>');
    assert.notEqual(unmarked, toranomon);
    assert.equal(count(toranomonToKachidoki(unmarked)), count(toranomonToKachidoki(toranomon)));
});
