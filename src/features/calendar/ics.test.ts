import { describe, expect, it } from 'vitest';
import type { Trip } from '../../domain/types';
import {
  DEFAULT_DEPARTURE_ALARM_MINUTES,
  DEFAULT_RETURN_ALARM_MINUTES,
  IcsGenerationError,
  escapeIcsText,
  foldIcsLine,
  generateIcs,
  parseTripDateTime,
  sanitizeIcsFilename,
  validateIcs,
  validateIcsContent,
} from './ics';

const FIXED_NOW = new Date('2026-01-02T03:04:05.000Z');

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: 'trip-123',
    name: 'Big Almaty Lake day hike',
    destination: 'Big Almaty Lake trail',
    departureAt: '2026-07-15T08:00',
    returnAt: '2026-07-15T18:00',
    groupSize: 3,
    notes: 'Meet at the trailhead.',
    status: 'ready',
    createdAt: '2026-07-01T10:00:00.000Z',
    updatedAt: '2026-07-01T10:00:00.000Z',
    checklist: [],
    readiness: {
      durationHours: 10,
      groupExperience: 'some',
      connectivity: 'unreliable',
      forecastAvailable: true,
      routeType: 'marked',
    },
    safetyPlan: null,
    track: null,
    ...overrides,
  };
}

function unfold(ics: string): string {
  return ics.replace(/\r\n[ ]/g, '');
}

function alarmBlocks(ics: string): string[] {
  return ics
    .split('BEGIN:VALARM')
    .slice(1)
    .map((block) => block.split('END:VALARM')[0]);
}

describe('generateIcs', () => {
  it('produces a valid VCALENDAR/VEVENT structure', () => {
    const trip = makeTrip();
    const ics = generateIcs(trip, { now: FIXED_NOW });

    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//Dala Safe//Trip Reminder//EN');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain(`UID:${trip.id}@dala-safe.app`);
    expect(ics).toContain('DTSTAMP:20260102T030405Z');
    expect(ics).toContain('DTSTART:20260715T030000Z');
    expect(ics).toContain('DTEND:20260715T130000Z');
    expect(ics).toContain(`SUMMARY:${trip.name}`);
    expect(ics).toContain('DESCRIPTION:');
    expect(validateIcsContent(ics)).toEqual([]);
  });

  it('contains exactly two correctly configured display alarms', () => {
    const ics = generateIcs(makeTrip(), { now: FIXED_NOW });
    const blocks = alarmBlocks(ics);

    expect(blocks).toHaveLength(2);
    for (const block of blocks) {
      expect(block).toContain('ACTION:DISPLAY');
      expect(block).toContain('DESCRIPTION:');
    }
    expect(blocks[0]).toContain(`TRIGGER:-PT${DEFAULT_DEPARTURE_ALARM_MINUTES / 60}H`);
    expect(blocks[1]).toContain(`TRIGGER;RELATED=END:-PT${DEFAULT_RETURN_ALARM_MINUTES / 60}H`);
  });

  it('supports an alarm exactly at the expected return time', () => {
    const ics = generateIcs(makeTrip(), {
      now: FIXED_NOW,
      departureAlarmMinutes: 30,
      returnAlarmMinutes: 0,
    });
    const blocks = alarmBlocks(ics);

    expect(blocks[0]).toContain('TRIGGER:-PT30M');
    expect(blocks[1]).toContain('TRIGGER;RELATED=END:PT0S');
  });

  it('converts Asia/Almaty wall-clock times to UTC', () => {
    const ics = generateIcs(makeTrip(), { now: FIXED_NOW });

    expect(ics).toContain('DTSTART:20260715T030000Z');
    expect(ics).toContain('DTEND:20260715T130000Z');
    expect(parseTripDateTime('2026-07-15T08:00')?.toISOString()).toBe(
      '2026-07-15T03:00:00.000Z',
    );
  });

  it('respects explicit offsets instead of applying Almaty twice', () => {
    const withOffset = generateIcs(
      makeTrip({
        departureAt: '2026-07-15T08:00:00+05:00',
        returnAt: '2026-07-15T18:00:00+05:00',
      }),
      { now: FIXED_NOW },
    );
    const inUtc = generateIcs(
      makeTrip({
        departureAt: '2026-07-15T08:00:00.000Z',
        returnAt: '2026-07-15T18:00:00.000Z',
      }),
      { now: FIXED_NOW },
    );

    expect(withOffset).toContain('DTSTART:20260715T030000Z');
    expect(inUtc).toContain('DTSTART:20260715T080000Z');
    expect(inUtc).toContain('DTEND:20260715T180000Z');
  });

  it('escapes backslashes, semicolons, commas and newlines', () => {
    const trip = makeTrip({
      name: 'Lake; hike, "quoted"\nand\\backslash',
      destination: 'Trail, north; ridge',
      notes: 'Line one\nLine two, with; punctuation\\',
    });
    const ics = unfold(generateIcs(trip, { now: FIXED_NOW }));

    expect(ics).toContain('SUMMARY:Lake\\; hike\\, "quoted"\\nand\\\\backslash');
    expect(ics).toContain('LOCATION:Trail\\, north\\; ridge');
    expect(ics).toContain('Line one\\nLine two\\, with\\; punctuation\\\\');
    expect(escapeIcsText('a\\b;c,d\r\ne')).toBe('a\\\\b\\;c\\,d\\ne');
    expect(validateIcsContent(generateIcs(trip, { now: FIXED_NOW }))).toEqual([]);
  });

  it('folds long UTF-8 lines at 75 octets without splitting characters', () => {
    const name = 'Қазақстан таулары мен көлдері '.repeat(8).trim();
    const ics = generateIcs(makeTrip({ name }), { now: FIXED_NOW });
    const physicalLines = ics.split('\r\n').filter(Boolean);
    const encoder = new TextEncoder();

    for (const line of physicalLines) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
    }
    expect(() => new TextDecoder('utf-8', { fatal: true }).decode(encoder.encode(ics))).not.toThrow();
    expect(unfold(ics)).toContain(`SUMMARY:${name}`);

    const folded = foldIcsLine('a'.repeat(200));
    const foldedLines = folded.split('\r\n');
    expect(foldedLines.length).toBeGreaterThan(2);
    for (const line of foldedLines) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
    }
    expect(foldedLines.slice(1).every((line) => line.startsWith(' '))).toBe(true);
    expect(folded.replace(/\r\n /g, '')).toBe('a'.repeat(200));
  });

  it('uses CRLF line endings only', () => {
    const ics = generateIcs(makeTrip(), { now: FIXED_NOW });

    expect(ics).not.toMatch(/(?<!\r)\n/);
    expect(ics).not.toMatch(/\r(?!\n)/);
    expect(ics.endsWith('\r\n')).toBe(true);
    expect(validateIcsContent(ics).filter((issue) => issue.code === 'line-endings')).toEqual([]);
  });

  it('is deterministic when now is injected', () => {
    const trip = makeTrip();
    const first = generateIcs(trip, { now: FIXED_NOW });
    const second = generateIcs(trip, { now: new Date(FIXED_NOW.getTime()) });
    const later = generateIcs(trip, { now: new Date('2026-01-02T03:04:06.000Z') });

    expect(first).toBe(second);
    expect(later).not.toBe(first);
    expect(later.split('\r\n').filter((line) => !line.startsWith('DTSTAMP:'))).toEqual(
      first.split('\r\n').filter((line) => !line.startsWith('DTSTAMP:')),
    );
    expect(later).toContain('DTSTAMP:20260102T030406Z');
  });
});

describe('validation', () => {
  it('rejects invalid dates', () => {
    const result = validateIcs(makeTrip({ departureAt: 'not-a-date' }));

    expect(result.valid).toBe(false);
    expect(result.errors.map((issue) => issue.code)).toContain('invalid-departure');
    expect(() => generateIcs(makeTrip({ departureAt: 'not-a-date' }))).toThrow(IcsGenerationError);
  });

  it('rejects a return time before departure', () => {
    const trip = makeTrip({
      departureAt: '2026-07-15T18:00',
      returnAt: '2026-07-15T08:00',
    });
    const result = validateIcs(trip);

    expect(result.valid).toBe(false);
    expect(result.errors.map((issue) => issue.code)).toContain('return-not-after-departure');
    expect(() => generateIcs(trip)).toThrow(IcsGenerationError);
  });

  it('rejects an invalid injected timestamp and invalid alarm offsets', () => {
    const result = validateIcs(makeTrip(), {
      now: new Date('invalid'),
      departureAlarmMinutes: Number.NaN,
      returnAlarmMinutes: -1,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((issue) => issue.code)).toContain('invalid-now');
    expect(result.errors.filter((issue) => issue.code === 'invalid-alarm')).toHaveLength(2);
  });

  it('detects broken alarm configuration and line endings in content', () => {
    const ics = generateIcs(makeTrip(), { now: FIXED_NOW });
    const withoutAlarms = ics.replace(/BEGIN:VALARM\r\n[\s\S]*?END:VALARM\r\n/g, '');
    const broken = ics.replace(/\r\n/g, '\n');

    expect(validateIcsContent(withoutAlarms).map((issue) => issue.code)).toContain('alarm-count');
    expect(validateIcsContent(broken).map((issue) => issue.code)).toContain('line-endings');
  });
});

describe('sanitizeIcsFilename', () => {
  it('removes unsafe filename characters and falls back when empty', () => {
    expect(sanitizeIcsFilename('Big Almaty / Lake: day* hike?')).toBe(
      'Big-Almaty-Lake-day-hike-reminder.ics',
    );
    expect(sanitizeIcsFilename('   ')).toBe('trip-reminder.ics');
    expect(sanitizeIcsFilename('..\\../trip')).toMatch(/\.ics$/);
  });
});
