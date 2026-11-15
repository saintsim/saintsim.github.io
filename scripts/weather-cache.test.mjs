// Checks the weather fetch and cache helpers in src/weather-cache.ts.
// Imports the compiled built/weather-cache.js, so run `npx tsc` first. Run with `npm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { todayInZone, parseForecast, forecastDate, usableCache, describeHttpError } from '../built/weather-cache.js';

const hours = value => Array(24).fill(value);
const forecastBody = (date, overrides = {}) => JSON.stringify({
    current: { time: `${date}T15:00`, weather_code: 2, apparent_temperature: 12 },
    hourly: { apparent_temperature: hours(12), precipitation_probability: hours(10), rain: hours(0), snowfall: hours(0), weathercode: hours(2) },
    ...overrides,
});
const cache = (body, savedAt = '2026-11-15T03:00:00.000Z') => JSON.stringify({ savedAt, body });

test('today is Tokyo\'s date, not the device\'s', () => {
    // 16:00 UTC on the 15th is already 01:00 on the 16th in Tokyo
    assert.equal(todayInZone(new Date('2026-11-15T16:00:00Z')), '2026-11-16');
    assert.equal(todayInZone(new Date('2026-11-15T14:59:00Z')), '2026-11-15');
    assert.equal(todayInZone(new Date('2026-11-15T16:00:00Z'), 'UTC'), '2026-11-15');
});

test('a forecast is dated by current.time', () => {
    assert.equal(forecastDate(parseForecast(forecastBody('2026-11-15'))), '2026-11-15');
});

test('a forecast missing a field the page draws is rejected', () => {
    assert.throws(() => parseForecast(forecastBody('2026-11-15', { hourly: undefined })), /missing hourly\.apparent_temperature/);
    assert.throws(() => parseForecast(JSON.stringify({ current: {} })), /missing current\.time/);
    assert.throws(() => parseForecast('<html>'), SyntaxError);
});

test('a forecast without every hour of the day is rejected', () => {
    const hourly = { apparent_temperature: hours(12), precipitation_probability: hours(10), rain: hours(0), snowfall: hours(0), weathercode: hours(2) };
    assert.throws(() => parseForecast(forecastBody('2026-11-15', { hourly: { ...hourly, rain: [] } })), /missing hourly\.rain/);
    assert.throws(() => parseForecast(forecastBody('2026-11-15', { hourly: { ...hourly, apparent_temperature: hours(12).slice(1) } })),
        /missing hourly\.apparent_temperature/);
});

test('the cache is used only for today\'s forecast', () => {
    assert.equal(usableCache(cache(forecastBody('2026-11-15')), '2026-11-15').savedAt, '2026-11-15T03:00:00.000Z');
    assert.equal(usableCache(cache(forecastBody('2026-11-14')), '2026-11-15'), null);
});

test('a missing or broken cache is not used', () => {
    assert.equal(usableCache(null, '2026-11-15'), null);
    assert.equal(usableCache('not json', '2026-11-15'), null);
    assert.equal(usableCache(cache(forecastBody('2026-11-15'), 'not a date'), '2026-11-15'), null);
    assert.equal(usableCache(cache(forecastBody('2026-11-15', { hourly: undefined })), '2026-11-15'), null);
});

test('HTTP errors use open-meteo\'s reason when it gives one', () => {
    assert.equal(describeHttpError(429, 'Too Many Requests', '{"error":true,"reason":"Daily API request limit exceeded."}'),
        'HTTP 429: Daily API request limit exceeded.');
    assert.equal(describeHttpError(404, 'Not Found', '<html>'), 'HTTP 404: Not Found');
    assert.equal(describeHttpError(500, '', ''), 'HTTP 500');
});
