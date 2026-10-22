import { describe, expect, it, vi } from 'vitest';
import { createTrip } from '../../domain/trip';
import type { Trip } from '../../domain/types';
import { createMemoryStorage, STORAGE_KEYS } from '../../data/storage';
import {
  MAX_IMPORT_BYTES,
  TripImportError,
  checkImportSize,
  clearStoredLocalData,
  downloadTripExport,
  exportFilename,
  mergeTripImports,
  readImportFile,
  serializeTripExport,
} from './tripData';

const NOW = new Date('2026-10-20T10:00:00.000Z');

function makeTrip(id: string, name = `Trip ${id}`): Trip {
  return {
    ...createTrip(
      {
        name,
        destination: 'Almaty mountains',
        departureAt: '2026-10-21T06:00',
        returnAt: '2026-10-21T18:00',
        groupSize: 3,
        notes: 'Private note',
      },
      NOW,
    ),
    id,
  };
}

function exportFile(trips: Trip[]): File {
  return new File([serializeTripExport(trips, NOW)], 'export.json', { type: 'application/json' });
}

describe('trip export', () => {
  it('builds the documented JSON format with all trip fields', () => {
    const trip = makeTrip('trip-a');
    const payload = JSON.parse(serializeTripExport([trip], NOW)) as {
      format: string;
      version: number;
      exportedAt: string;
      trips: Trip[];
    };

    expect(payload.format).toBe('dala-safe-trip-export');
    expect(payload.version).toBe(1);
    expect(payload.exportedAt).toBe(NOW.toISOString());
    expect(payload.trips).toHaveLength(1);
    expect(payload.trips[0]).toMatchObject({
      id: 'trip-a',
      name: 'Trip trip-a',
      destination: 'Almaty mountains',
      notes: 'Private note',
      groupSize: 3,
    });
  });

  it('uses a date-stamped filename', () => {
    expect(exportFilename(new Date(2026, 0, 5))).toBe('dala-safe-trips-2026-01-05.json');
    expect(exportFilename(new Date(2026, 11, 31))).toBe('dala-safe-trips-2026-12-31.json');
  });

  it('downloads a JSON blob through a temporary link', () => {
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:dala-safe');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });

    let downloadedName = '';
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloadedName = this.download;
      });

    try {
      const filename = downloadTripExport([makeTrip('trip-a')], NOW);

      expect(filename).toBe('dala-safe-trips-2026-10-20.json');
      expect(downloadedName).toBe(filename);
      expect(createObjectURL).toHaveBeenCalledTimes(1);
      const blob = createObjectURL.mock.calls[0][0] as unknown as Blob;
      expect(blob.type).toBe('application/json');
      expect(click).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: originalCreate });
      Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: originalRevoke });
    }
  });
});

describe('trip import', () => {
  it('reads a valid export', async () => {
    const trips = await readImportFile(exportFile([makeTrip('trip-a'), makeTrip('trip-b')]));
    expect(trips.map((trip) => trip.id)).toEqual(['trip-a', 'trip-b']);
  });

  it('rejects invalid JSON and wrong formats', async () => {
    await expect(readImportFile(new File(['not json'], 'bad.json'))).rejects.toMatchObject({
      code: 'invalid',
    });
    await expect(
      readImportFile(new File(['{"format":"other","version":1,"trips":[]}'], 'bad.json')),
    ).rejects.toMatchObject({ code: 'invalid' });
  });

  it('enforces the 5 MB size limit', async () => {
    expect(() => checkImportSize(MAX_IMPORT_BYTES)).not.toThrow();
    expect(() => checkImportSize(MAX_IMPORT_BYTES + 1)).toThrow(TripImportError);

    const tooLarge = new File([new Uint8Array(MAX_IMPORT_BYTES + 1)], 'large.json', {
      type: 'application/json',
    });
    await expect(readImportFile(tooLarge)).rejects.toMatchObject({ code: 'too-large' });
  });

  it('replaces duplicate ids and prepends new trips', () => {
    const existingA = makeTrip('trip-a', 'Stored A');
    const existingC = makeTrip('trip-c', 'Stored C');
    const importedA = makeTrip('trip-a', 'Imported A');
    const importedB = makeTrip('trip-b', 'Imported B');

    const result = mergeTripImports([existingA, existingC], [importedA, importedB]);

    expect(result.trips.map((trip) => trip.id)).toEqual(['trip-a', 'trip-b', 'trip-c']);
    expect(result.trips[0].name).toBe('Imported A');
    expect(result.added).toBe(1);
    expect(result.replaced).toBe(1);
  });

  it('uses the last copy when an import repeats an id', () => {
    const first = makeTrip('trip-a', 'First');
    const last = makeTrip('trip-a', 'Last');
    const result = mergeTripImports([], [first, last]);

    expect(result.trips).toHaveLength(1);
    expect(result.trips[0].name).toBe('Last');
    expect(result.added).toBe(1);
    expect(result.replaced).toBe(0);
  });

  it('keeps stored trips that are not in the import', () => {
    const result = mergeTripImports([makeTrip('trip-c')], [makeTrip('trip-a')]);
    expect(result.trips.map((trip) => trip.id)).toEqual(['trip-a', 'trip-c']);
    expect(result.added).toBe(1);
    expect(result.replaced).toBe(0);
  });
});

describe('delete all local data', () => {
  it('removes trips, settings, demo and quarantined keys', () => {
    const quarantined = `${STORAGE_KEYS.trips}:corrupt:123`;
    window.localStorage.setItem(STORAGE_KEYS.trips, 'trips');
    window.localStorage.setItem(STORAGE_KEYS.settings, 'settings');
    window.localStorage.setItem(STORAGE_KEYS.demo, 'demo');
    window.localStorage.setItem(quarantined, 'damaged raw data');

    clearStoredLocalData(window.localStorage);

    expect(window.localStorage.getItem(STORAGE_KEYS.trips)).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.settings)).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.demo)).toBeNull();
    expect(window.localStorage.getItem(quarantined)).toBeNull();
  });

  it('still removes the primary keys when storage cannot be enumerated', () => {
    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEYS.trips, 'trips');
    storage.setItem(STORAGE_KEYS.settings, 'settings');
    storage.setItem(STORAGE_KEYS.demo, 'demo');

    clearStoredLocalData(storage);

    expect(storage.getItem(STORAGE_KEYS.trips)).toBeNull();
    expect(storage.getItem(STORAGE_KEYS.settings)).toBeNull();
    expect(storage.getItem(STORAGE_KEYS.demo)).toBeNull();
  });
});
