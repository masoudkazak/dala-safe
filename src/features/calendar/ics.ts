import type { Trip } from '../../domain/types';

export const ALMATY_TIME_ZONE = 'Asia/Almaty';
export const DEFAULT_DEPARTURE_ALARM_MINUTES = 120;
export const DEFAULT_RETURN_ALARM_MINUTES = 60;

const UID_DOMAIN = 'dala-safe.app';
const PRODID = '-//Dala Safe//Trip Reminder//EN';
const MAX_LINE_OCTETS = 75;
const WALL_CLOCK_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/;
const EXPLICIT_ZONE_PATTERN = /(?:Z|[+-]\d{2}:?\d{2})$/i;

export type IcsIssueCode =
  | 'missing-trip'
  | 'missing-trip-id'
  | 'missing-trip-name'
  | 'invalid-departure'
  | 'invalid-return'
  | 'return-not-after-departure'
  | 'invalid-now'
  | 'invalid-timezone'
  | 'invalid-alarm'
  | 'nan-date';

export interface IcsIssue {
  code: IcsIssueCode;
  field: 'trip' | 'id' | 'name' | 'departureAt' | 'returnAt' | 'now' | 'timeZone' | 'alarm';
  message: string;
}

export interface IcsValidationResult {
  valid: boolean;
  errors: IcsIssue[];
  warnings: IcsIssue[];
}

export interface IcsOptions {
  now?: Date;
  timeZone?: string;
  departureAlarmMinutes?: number;
  returnAlarmMinutes?: number;
}

export type IcsContentIssueCode =
  | 'invalid-content'
  | 'line-endings'
  | 'line-too-long'
  | 'structure'
  | 'missing-property'
  | 'alarm-count'
  | 'alarm-configuration'
  | 'invalid-date';

export interface IcsContentIssue {
  code: IcsContentIssueCode;
  message: string;
}

export class IcsGenerationError extends Error {
  readonly issues: IcsIssue[];

  constructor(issues: IcsIssue[]) {
    super(
      `Cannot generate calendar file: ${issues
        .map((issue) => issue.message)
        .join('; ')}`,
    );
    this.name = 'IcsGenerationError';
    this.issues = issues;
  }
}

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const values: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') values[part.type] = part.value;
  }
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

function wallClockToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  millisecond: number,
  timeZone: string,
): Date | null {
  const wallUtc = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
  const check = new Date(wallUtc);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day ||
    check.getUTCHours() !== hour ||
    check.getUTCMinutes() !== minute ||
    check.getUTCSeconds() !== second
  ) {
    return null;
  }

  try {
    let offset = getTimeZoneOffsetMs(new Date(wallUtc), timeZone);
    let instant = wallUtc - offset;
    const adjustedOffset = getTimeZoneOffsetMs(new Date(instant), timeZone);
    if (adjustedOffset !== offset) {
      offset = adjustedOffset;
      instant = wallUtc - offset;
    }
    const result = new Date(instant);
    return Number.isFinite(result.getTime()) ? result : null;
  } catch {
    return null;
  }
}

/**
 * Converts an ISO-like trip timestamp to an absolute instant.
 *
 * Values with an explicit offset (`Z`, `+05:00`) are treated as absolute.
 * Values without an offset are interpreted as Asia/Almaty wall-clock time.
 */
export function parseTripDateTime(
  value: string | null | undefined,
  timeZone: string = ALMATY_TIME_ZONE,
): Date | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (EXPLICIT_ZONE_PATTERN.test(trimmed)) {
    const normalized = trimmed.replace(/^(\d{4}-\d{2}-\d{2}) /, '$1T');
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const match = WALL_CLOCK_PATTERN.exec(trimmed);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4] ?? '0');
  const minute = Number(match[5] ?? '0');
  const second = Number(match[6] ?? '0');
  const millisecond = Number((match[7] ?? '').padEnd(3, '0') || '0');

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (hour > 23 || minute > 59 || second > 59) return null;

  return wallClockToUtc(year, month, day, hour, minute, second, millisecond, timeZone);
}

export function formatUtcDateTime(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
}

export function formatInTimeZone(date: Date, timeZone: string = ALMATY_TIME_ZONE): string {
  const parts = getZonedParts(date, timeZone);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)} ${pad(parts.hour)}:${pad(parts.minute)} (${timeZone})`;
}

/** RFC 5545 TEXT escaping. */
export function escapeIcsText(value: string): string {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/**
 * Folds a single logical content line at 75 UTF-8 octets. Continuation lines
 * start with one space and therefore carry at most 74 content octets.
 */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  const characters = Array.from(line);
  const segments: string[] = [];
  let current = '';
  let currentOctets = 0;
  let limit = MAX_LINE_OCTETS;

  for (const character of characters) {
    const characterOctets = encoder.encode(character).length;
    if (currentOctets + characterOctets > limit) {
      segments.push(current);
      current = character;
      currentOctets = characterOctets;
      limit = MAX_LINE_OCTETS - 1;
    } else {
      current += character;
      currentOctets += characterOctets;
    }
  }
  segments.push(current);
  return segments.join('\r\n ');
}

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date(0));
    return true;
  } catch {
    return false;
  }
}

function isFiniteDate(value: Date | null): value is Date {
  return value !== null && Number.isFinite(value.getTime());
}

function alarmSetting(
  value: number | undefined,
  fallback: number,
): { ok: boolean; minutes: number } {
  const minutes = value ?? fallback;
  return {
    ok: Number.isInteger(minutes) && minutes >= 0 && minutes <= 100_800,
    minutes,
  };
}

function stripUnsafeFilenameCharacters(value: string): string {
  const unsafe = '<>:"/\\|?*';
  let result = '';
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if (code < 32 || code === 127 || unsafe.includes(character)) {
      result += ' ';
    } else {
      result += character;
    }
  }
  return result;
}

export function sanitizeIcsFilename(name: string, fallback = 'trip'): string {
  const base = stripUnsafeFilenameCharacters(String(name ?? '').normalize('NFC'))
    .replace(/\s+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .slice(0, 80)
    .replace(/[.-]+$/g, '');
  return `${base || fallback}-reminder.ics`;
}

export function downloadIcsFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const canCreateObjectUrl = typeof URL.createObjectURL === 'function';
  const url = canCreateObjectUrl
    ? URL.createObjectURL(blob)
    : `data:text/calendar;charset=utf-8,${encodeURIComponent(content)}`;
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  if (canCreateObjectUrl) {
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

export function validateIcs(
  trip: Trip | null | undefined,
  options: IcsOptions = {},
): IcsValidationResult {
  const errors: IcsIssue[] = [];
  const warnings: IcsIssue[] = [];
  const timeZone = options.timeZone ?? ALMATY_TIME_ZONE;
  const now = options.now ?? new Date();

  if (!trip) {
    errors.push({
      code: 'missing-trip',
      field: 'trip',
      message: 'Trip is missing.',
    });
    return { valid: false, errors, warnings };
  }

  if (!isValidTimeZone(timeZone)) {
    errors.push({
      code: 'invalid-timezone',
      field: 'timeZone',
      message: `Unsupported time zone: ${timeZone}.`,
    });
  }

  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    errors.push({
      code: 'invalid-now',
      field: 'now',
      message: 'The injected current time is invalid.',
    });
  }

  if (typeof trip.id !== 'string' || !trip.id.trim()) {
    errors.push({
      code: 'missing-trip-id',
      field: 'id',
      message: 'Trip id is required for a stable calendar UID.',
    });
  }

  if (typeof trip.name !== 'string' || !trip.name.trim()) {
    warnings.push({
      code: 'missing-trip-name',
      field: 'name',
      message: 'Trip name is empty.',
    });
  }

  const departure = parseTripDateTime(trip.departureAt, timeZone);
  const returnDate = parseTripDateTime(trip.returnAt, timeZone);

  if (!isFiniteDate(departure)) {
    errors.push({
      code: 'invalid-departure',
      field: 'departureAt',
      message: 'Departure date and time are invalid.',
    });
  }

  if (!isFiniteDate(returnDate)) {
    errors.push({
      code: 'invalid-return',
      field: 'returnAt',
      message: 'Return date and time are invalid.',
    });
  }

  if (isFiniteDate(departure) && isFiniteDate(returnDate)) {
    if (returnDate.getTime() <= departure.getTime()) {
      errors.push({
        code: 'return-not-after-departure',
        field: 'returnAt',
        message: 'Return must be after departure.',
      });
    }
    if (!Number.isFinite(departure.getTime()) || !Number.isFinite(returnDate.getTime())) {
      errors.push({
        code: 'nan-date',
        field: 'returnAt',
        message: 'A date contains NaN.',
      });
    }
  }

  const departureAlarm = alarmSetting(
    options.departureAlarmMinutes,
    DEFAULT_DEPARTURE_ALARM_MINUTES,
  );
  const returnAlarm = alarmSetting(options.returnAlarmMinutes, DEFAULT_RETURN_ALARM_MINUTES);

  if (!departureAlarm.ok) {
    errors.push({
      code: 'invalid-alarm',
      field: 'alarm',
      message: 'Departure alarm must be a whole number of minutes between 0 and 100800.',
    });
  }
  if (!returnAlarm.ok) {
    errors.push({
      code: 'invalid-alarm',
      field: 'alarm',
      message: 'Return alarm must be a whole number of minutes between 0 and 100800.',
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

function formatAlarmOffset(minutes: number): string {
  if (minutes === 0) return 'PT0S';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `-PT${hours > 0 ? `${hours}H` : ''}${rest > 0 ? `${rest}M` : ''}`;
}

function buildDescription(
  trip: Trip,
  departure: Date,
  returnDate: Date,
  timeZone: string,
): string {
  const lines = [
    `Trip: ${trip.name ?? ''}`,
    `Destination: ${trip.destination?.trim() || '—'}`,
    `Planned departure: ${formatInTimeZone(departure, timeZone)}`,
    `Expected return: ${formatInTimeZone(returnDate, timeZone)}`,
    `Group size: ${trip.groupSize ?? '—'}`,
  ];
  const notes = trip.notes?.trim();
  if (notes) lines.push(`Notes: ${notes}`);
  lines.push(
    'Generated by Dala Safe as a personal reminder.',
    'This is not an official trip registration, a rescue service, or a guarantee that an alarm will fire. Calendar apps may ignore or limit alarms. Follow official safety guidance.',
  );
  return lines.join('\n');
}

export function generateIcs(trip: Trip, options: IcsOptions = {}): string {
  const validation = validateIcs(trip, options);
  if (!validation.valid) throw new IcsGenerationError(validation.errors);

  const timeZone = options.timeZone ?? ALMATY_TIME_ZONE;
  const departure = parseTripDateTime(trip.departureAt, timeZone);
  const returnDate = parseTripDateTime(trip.returnAt, timeZone);
  if (!isFiniteDate(departure) || !isFiniteDate(returnDate)) {
    throw new IcsGenerationError([
      {
        code: 'nan-date',
        field: 'departureAt',
        message: 'Dates could not be converted to a valid instant.',
      },
    ]);
  }

  const now = options.now ?? new Date();
  const departureAlarm = options.departureAlarmMinutes ?? DEFAULT_DEPARTURE_ALARM_MINUTES;
  const returnAlarm = options.returnAlarmMinutes ?? DEFAULT_RETURN_ALARM_MINUTES;
  const uid = `${escapeIcsText(trip.id.trim())}@${UID_DOMAIN}`;
  const description = buildDescription(trip, departure, returnDate, timeZone);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODID}`,
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${escapeIcsText(`Dala Safe: ${trip.name ?? ''}`)}`,
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatUtcDateTime(now)}`,
    `DTSTART:${formatUtcDateTime(departure)}`,
    `DTEND:${formatUtcDateTime(returnDate)}`,
    `SUMMARY:${escapeIcsText(trip.name ?? '')}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    ...(trip.destination?.trim()
      ? [`LOCATION:${escapeIcsText(trip.destination.trim())}`]
      : []),
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `TRIGGER:${formatAlarmOffset(departureAlarm)}`,
    `DESCRIPTION:${escapeIcsText(
      `Departure check for ${trip.name ?? ''} at ${formatInTimeZone(departure, timeZone)}. Dala Safe personal reminder.`,
    )}`,
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `TRIGGER;RELATED=END:${formatAlarmOffset(returnAlarm)}`,
    `DESCRIPTION:${escapeIcsText(
      `Return check for ${trip.name ?? ''}; expected back at ${formatInTimeZone(returnDate, timeZone)}. Dala Safe personal reminder.`,
    )}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}

function unfoldLines(physicalLines: string[]): string[] {
  const logical: string[] = [];
  for (const line of physicalLines) {
    if (line.startsWith(' ') && logical.length > 0) {
      logical[logical.length - 1] += line.slice(1);
    } else {
      logical.push(line);
    }
  }
  return logical;
}

function parseIcsUtc(value: string): Date | null {
  if (!/^\d{8}T\d{6}Z$/.test(value)) return null;
  const date = new Date(
    `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(
      9,
      11,
    )}:${value.slice(11, 13)}:${value.slice(13, 15)}Z`,
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

export function validateIcsContent(content: string): IcsContentIssue[] {
  const issues: IcsContentIssue[] = [];
  if (typeof content !== 'string' || content.length === 0) {
    return [{ code: 'invalid-content', message: 'Calendar content is empty.' }];
  }

  if (!content.endsWith('\r\n')) {
    issues.push({
      code: 'line-endings',
      message: 'Calendar content must end with CRLF.',
    });
  }

  const body = content.endsWith('\r\n') ? content.slice(0, -2) : content;
  if (/(?<!\r)\n|\r(?!\n)/.test(body)) {
    issues.push({
      code: 'line-endings',
      message: 'Calendar content must use CRLF line endings only.',
    });
  }

  const physicalLines = body.split('\r\n');
  const encoder = new TextEncoder();
  for (const line of physicalLines) {
    if (encoder.encode(line).length > MAX_LINE_OCTETS) {
      issues.push({
        code: 'line-too-long',
        message: `A physical line exceeds ${MAX_LINE_OCTETS} octets.`,
      });
      break;
    }
  }

  const logicalLines = unfoldLines(physicalLines);
  if (logicalLines[0] !== 'BEGIN:VCALENDAR' || logicalLines[logicalLines.length - 1] !== 'END:VCALENDAR') {
    issues.push({
      code: 'structure',
      message: 'VCALENDAR boundaries are missing.',
    });
  }

  const eventBegins = logicalLines.filter((line) => line === 'BEGIN:VEVENT').length;
  const eventEnds = logicalLines.filter((line) => line === 'END:VEVENT').length;
  if (eventBegins !== 1 || eventEnds !== 1) {
    issues.push({
      code: 'structure',
      message: 'Exactly one VEVENT is required.',
    });
  }

  const textProperties = ['UID', 'DTSTAMP', 'DTSTART', 'DTEND', 'SUMMARY', 'DESCRIPTION'];
  for (const property of textProperties) {
    if (!logicalLines.some((line) => line.startsWith(`${property}:`))) {
      issues.push({
        code: 'missing-property',
        message: `Missing ${property}.`,
      });
    }
  }

  const alarmBlocks: string[][] = [];
  let currentAlarm: string[] | null = null;
  for (const line of logicalLines) {
    if (line === 'BEGIN:VALARM') {
      currentAlarm = [];
      continue;
    }
    if (line === 'END:VALARM') {
      if (currentAlarm) alarmBlocks.push(currentAlarm);
      currentAlarm = null;
      continue;
    }
    if (currentAlarm) currentAlarm.push(line);
  }

  if (alarmBlocks.length !== 2) {
    issues.push({
      code: 'alarm-count',
      message: 'Exactly two VALARM entries are required.',
    });
  }

  for (const block of alarmBlocks) {
    if (!block.includes('ACTION:DISPLAY')) {
      issues.push({
        code: 'alarm-configuration',
        message: 'Each alarm must use ACTION:DISPLAY.',
      });
    }
    if (!block.some((line) => line.startsWith('DESCRIPTION:'))) {
      issues.push({
        code: 'alarm-configuration',
        message: 'Each alarm must contain a DESCRIPTION.',
      });
    }
    const trigger = block.find((line) => line.startsWith('TRIGGER'));
    if (
      !trigger ||
      !/^TRIGGER(?:;RELATED=(?:START|END))?:(?:-?P(?:T(?:\d+H)?(?:\d+M)?(?:\d+S)?|\d+[DWM]))$/.test(
        trigger,
      )
    ) {
      issues.push({
        code: 'alarm-configuration',
        message: 'Each alarm must contain a valid relative TRIGGER.',
      });
    }
  }

  const dtstart = logicalLines.find((line) => line.startsWith('DTSTART:'))?.slice(8) ?? '';
  const dtend = logicalLines.find((line) => line.startsWith('DTEND:'))?.slice(6) ?? '';
  const start = parseIcsUtc(dtstart);
  const end = parseIcsUtc(dtend);
  if (!start || !end) {
    issues.push({
      code: 'invalid-date',
      message: 'DTSTART and DTEND must be valid UTC date-times.',
    });
  } else if (end.getTime() <= start.getTime()) {
    issues.push({
      code: 'invalid-date',
      message: 'DTEND must be after DTSTART.',
    });
  }

  return issues;
}
