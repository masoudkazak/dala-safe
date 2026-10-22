import { isRecord, readEnvelope, removeKey, STORAGE_KEYS, writeEnvelope, type StorageLike, type WriteResult } from './storage';
import type { ChecklistItem, GpxTrack, ReadinessAnswers, SafetyPlan, Trip } from '../domain/types';
import { CHECKLIST_TEMPLATES } from '../domain/trip';

const TRIP_STATUSES = new Set(['draft', 'ready', 'completed']);

export function isTrip(value: unknown): value is Trip {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.destination === 'string' &&
    typeof value.departureAt === 'string' &&
    typeof value.returnAt === 'string' &&
    typeof value.groupSize === 'number' &&
    typeof value.status === 'string' &&
    TRIP_STATUSES.has(value.status) &&
    Array.isArray(value.checklist) &&
    (value.checklist as unknown[]).every(isChecklistItem)
  );
}

function isChecklistItem(value: unknown): value is ChecklistItem {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.label === 'object' &&
    value.label !== null &&
    typeof (value.label as Record<string, unknown>).en === 'string' &&
    typeof value.required === 'boolean' &&
    typeof value.done === 'boolean'
  );
}

function isTripArray(value: unknown): value is Trip[] {
  return Array.isArray(value) && value.every(isTrip);
}

function hydrate(raw: Trip): Trip {
  const checklist = raw.checklist.length > 0 ? raw.checklist : defaultChecklistFallback();
  return {
    ...raw,
    notes: raw.notes ?? '',
    checklist,
    readiness: normalizeReadiness(raw.readiness),
    safetyPlan: raw.safetyPlan ?? null,
    track: normalizeTrack(raw.track),
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

function defaultChecklistFallback(): ChecklistItem[] {
  return CHECKLIST_TEMPLATES.map((template) => ({
    id: `chk-${template.id}`,
    templateId: template.id,
    label: { ...template.label },
    required: template.required,
    done: false,
    custom: false,
  }));
}

function normalizeReadiness(value: unknown): ReadinessAnswers {
  const base: ReadinessAnswers = {
    durationHours: null,
    groupExperience: null,
    connectivity: null,
    forecastAvailable: null,
    routeType: null,
  };
  if (!isRecord(value)) return base;
  return {
    durationHours: typeof value.durationHours === 'number' ? value.durationHours : null,
    groupExperience:
      value.groupExperience === 'first-time' || value.groupExperience === 'some' || value.groupExperience === 'experienced'
        ? value.groupExperience
        : null,
    connectivity:
      value.connectivity === 'none' || value.connectivity === 'unreliable' || value.connectivity === 'good'
        ? value.connectivity
        : null,
    forecastAvailable: typeof value.forecastAvailable === 'boolean' ? value.forecastAvailable : null,
    routeType:
      value.routeType === 'marked' || value.routeType === 'unmarked' || value.routeType === 'unknown'
        ? value.routeType
        : null,
  };
}

function normalizeTrack(value: unknown): GpxTrack | null {
  if (!isRecord(value)) return null;
  if (!Array.isArray(value.points)) return null;
  return value as unknown as GpxTrack;
}

export interface LoadTripsResult {
  trips: Trip[];
  corrupted: boolean;
}

export function loadTrips(storage: StorageLike): LoadTripsResult {
  const { data, corrupted } = readEnvelope(storage, STORAGE_KEYS.trips, isTripArray);
  if (!data) return { trips: [], corrupted };
  const valid = data.filter(isTrip).map(hydrate);
  return { trips: valid, corrupted: corrupted || valid.length !== data.length };
}

export function saveTrips(storage: StorageLike, trips: Trip[]): WriteResult {
  return writeEnvelope(storage, STORAGE_KEYS.trips, trips);
}

export function clearTrips(storage: StorageLike): void {
  removeKey(storage, STORAGE_KEYS.trips);
}

export function upsertTrip(trips: Trip[], next: Trip): Trip[] {
  const index = trips.findIndex((trip) => trip.id === next.id);
  if (index === -1) return [next, ...trips];
  const copy = [...trips];
  copy[index] = next;
  return copy;
}

export function removeTrip(trips: Trip[], id: string): Trip[] {
  return trips.filter((trip) => trip.id !== id);
}

export interface TripExport {
  format: 'dala-safe-trip-export';
  version: number;
  exportedAt: string;
  trips: Trip[];
}

export function buildTripExport(trips: Trip[], now: Date = new Date()): TripExport {
  return {
    format: 'dala-safe-trip-export',
    version: 1,
    exportedAt: now.toISOString(),
    trips: structuredClone(trips),
  };
}

export function parseTripExport(raw: string): Trip[] {
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed) || parsed.format !== 'dala-safe-trip-export' || !isTripArray(parsed.trips)) {
    throw new Error('INVALID_EXPORT');
  }
  return (parsed.trips as Trip[]).map(hydrate);
}

export type { SafetyPlan };
