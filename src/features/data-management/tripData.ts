import { getBrowserStorage, removeKey, STORAGE_KEYS, type StorageLike } from '../../data/storage';
import { buildTripExport, parseTripExport } from '../../data/tripRepository';
import type { Trip } from '../../domain/types';

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
export const EXPORT_FILENAME_PREFIX = 'dala-safe-trips-';

export type TripImportErrorCode = 'too-large' | 'invalid';

export class TripImportError extends Error {
  readonly code: TripImportErrorCode;

  constructor(code: TripImportErrorCode) {
    super(code);
    this.name = 'TripImportError';
    this.code = code;
  }
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function exportFilename(now: Date = new Date()): string {
  return `${EXPORT_FILENAME_PREFIX}${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

export function serializeTripExport(trips: Trip[], now: Date = new Date()): string {
  return JSON.stringify(buildTripExport(trips, now), null, 2);
}

export function downloadTripExport(trips: Trip[], now: Date = new Date()): string {
  const json = serializeTripExport(trips, now);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const filename = exportFilename(now);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    if (typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url);
  }, 0);
  return filename;
}

export function checkImportSize(size: number): void {
  if (size > MAX_IMPORT_BYTES) throw new TripImportError('too-large');
}

function readFileText(file: File): Promise<string> {
  if (typeof file.text === 'function') return file.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('READ_FAILED'));
    reader.readAsText(file);
  });
}

export async function readImportFile(file: File): Promise<Trip[]> {
  checkImportSize(file.size);
  let raw: string;
  try {
    raw = await readFileText(file);
  } catch {
    throw new TripImportError('invalid');
  }
  try {
    return parseTripExport(raw);
  } catch {
    throw new TripImportError('invalid');
  }
}

export interface ImportMergeResult {
  trips: Trip[];
  added: number;
  replaced: number;
}

/**
 * Imported trips are placed first. A trip with the same id replaces the stored
 * trip; new trips are prepended. If a file contains the same id more than once,
 * the last occurrence wins. Existing trips not present in the file are kept.
 */
export function mergeTripImports(existing: Trip[], imported: Trip[]): ImportMergeResult {
  const seen = new Set<string>();
  const uniqueImported: Trip[] = [];

  for (let index = imported.length - 1; index >= 0; index -= 1) {
    const trip = imported[index];
    if (seen.has(trip.id)) continue;
    seen.add(trip.id);
    uniqueImported.unshift(trip);
  }

  const existingIds = new Set(existing.map((trip) => trip.id));
  const replaced = uniqueImported.filter((trip) => existingIds.has(trip.id)).length;
  const added = uniqueImported.length - replaced;

  return {
    trips: [...uniqueImported, ...existing.filter((trip) => !seen.has(trip.id))],
    added,
    replaced,
  };
}

interface EnumerableStorage extends StorageLike {
  readonly length: number;
  key(index: number): string | null;
}

function clearQuarantinedCopies(storage: StorageLike): void {
  const candidate = storage as Partial<EnumerableStorage>;
  if (typeof candidate.key !== 'function' || typeof candidate.length !== 'number') return;

  const prefixes = Object.values(STORAGE_KEYS).map((key) => `${key}:corrupt:`);
  for (let index = candidate.length - 1; index >= 0; index -= 1) {
    const key = candidate.key(index);
    if (key && prefixes.some((prefix) => key.startsWith(prefix))) removeKey(storage, key);
  }
}

export function clearStoredLocalData(storage: StorageLike = getBrowserStorage()): void {
  removeKey(storage, STORAGE_KEYS.trips);
  removeKey(storage, STORAGE_KEYS.settings);
  removeKey(storage, STORAGE_KEYS.demo);
  clearQuarantinedCopies(storage);
}
