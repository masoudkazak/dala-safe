import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { createTrip } from '../../domain/trip';
import type { Trip } from '../../domain/types';
import { STORAGE_KEYS, STORAGE_VERSION } from '../../data/storage';
import { I18nProvider } from '../../i18n';
import { TripsProvider } from '../../data/TripsProvider';
import { DataManagementPage } from './DataManagementPage';
import { MAX_IMPORT_BYTES, serializeTripExport } from './tripData';

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

function envelope(data: unknown): string {
  return JSON.stringify({ version: STORAGE_VERSION, savedAt: NOW.toISOString(), data });
}

function seedStorage(trips: Trip[] = []): void {
  window.localStorage.setItem(
    STORAGE_KEYS.settings,
    envelope({ language: 'en', units: 'metric', onboardingComplete: false }),
  );
  window.localStorage.setItem(STORAGE_KEYS.trips, envelope(trips));
  window.localStorage.setItem(STORAGE_KEYS.demo, 'demo-state');
}

function renderPage() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <TripsProvider>
          <DataManagementPage />
        </TripsProvider>
      </I18nProvider>
    </MemoryRouter>,
  );
}

function tripFile(trips: Trip[], name = 'export.json'): File {
  return new File([serializeTripExport(trips, NOW)], name, { type: 'application/json' });
}

function blobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('READ_FAILED'));
    reader.readAsText(blob);
  });
}

function storedTrips(): Trip[] {
  const raw = window.localStorage.getItem(STORAGE_KEYS.trips);
  if (!raw) return [];
  return (JSON.parse(raw) as { data: Trip[] }).data;
}

describe('DataManagementPage', () => {
  it('disables export when there are no trips', async () => {
    seedStorage();
    renderPage();
    expect(await screen.findByRole('button', { name: 'Export all trips' })).toBeDisabled();
    expect(screen.getByText('There are no trips to export yet.')).toBeInTheDocument();
  });

  it('exports all trips with the documented format and filename', async () => {
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:dala-safe');
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });

    let downloadedName = '';
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      downloadedName = this.download;
    });

    try {
      seedStorage([makeTrip('trip-a'), makeTrip('trip-b')]);
      const user = userEvent.setup();
      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Export all trips' }));

      expect(await screen.findByText('Export downloaded. Trips included: 2.')).toBeInTheDocument();
      expect(downloadedName).toMatch(/^dala-safe-trips-\d{4}-\d{2}-\d{2}\.json$/);
      expect(createObjectURL).toHaveBeenCalledTimes(1);

      const blob = createObjectURL.mock.calls[0][0] as unknown as Blob;
      const payload = JSON.parse(await blobText(blob)) as { format: string; version: number; trips: Trip[] };
      expect(payload.format).toBe('dala-safe-trip-export');
      expect(payload.version).toBe(1);
      expect(payload.trips.map((trip) => trip.id)).toEqual(['trip-a', 'trip-b']);
    } finally {
      Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: originalCreate });
      Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: originalRevoke });
    }
  });

  it('imports valid trips, replaces duplicate ids and keeps existing trips', async () => {
    seedStorage([makeTrip('trip-a', 'Stored A'), makeTrip('trip-c', 'Stored C')]);
    const user = userEvent.setup();
    renderPage();

    const importedA = makeTrip('trip-a', 'Imported A');
    const importedB = makeTrip('trip-b', 'Imported B');
    await user.upload(
      await screen.findByLabelText('Choose a Dala Safe JSON file'),
      tripFile([importedA, importedB]),
    );

    expect(
      await screen.findByText('Import complete. Trips in file: 2; new: 1; replaced: 1.'),
    ).toBeInTheDocument();

    const trips = storedTrips();
    expect(trips.map((trip) => trip.id)).toEqual(['trip-a', 'trip-b', 'trip-c']);
    expect(trips[0].name).toBe('Imported A');
    expect(trips[2].name).toBe('Stored C');
  });

  it('shows an error and writes nothing for an invalid file', async () => {
    seedStorage([makeTrip('trip-a')]);
    const before = window.localStorage.getItem(STORAGE_KEYS.trips);
    const user = userEvent.setup();
    renderPage();

    await user.upload(
      await screen.findByLabelText('Choose a Dala Safe JSON file'),
      new File(['{"format":"not-dala-safe","version":1,"trips":[]}'], 'bad.json', {
        type: 'application/json',
      }),
    );

    expect(
      await screen.findByText('This file is not a valid Dala Safe export. Nothing was changed.'),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEYS.trips)).toBe(before);
  });

  it('rejects files above the 5 MB limit without writing', async () => {
    seedStorage([makeTrip('trip-a')]);
    const before = window.localStorage.getItem(STORAGE_KEYS.trips);
    const user = userEvent.setup();
    renderPage();

    const tooLarge = new File([new Uint8Array(MAX_IMPORT_BYTES + 1)], 'large.json', {
      type: 'application/json',
    });
    await user.upload(await screen.findByLabelText('Choose a Dala Safe JSON file'), tooLarge);

    expect(
      await screen.findByText('This file is larger than 5 MB. Nothing was changed.'),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEYS.trips)).toBe(before);
  });

  it('deletes all local data after confirmation', async () => {
    seedStorage([makeTrip('trip-a')]);
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Delete all local data' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete everything' }));

    expect(await screen.findByText('All local data was deleted from this browser.')).toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEYS.trips)).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.settings)).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.demo)).toBeNull();
  });

  it('shows quota messaging when a write fails', async () => {
    seedStorage([makeTrip('trip-a')]);
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key: string,
      value: string,
    ) {
      if (key === STORAGE_KEYS.trips) throw new DOMException('quota', 'QuotaExceededError');
      return originalSetItem.call(this, key, value);
    });

    const user = userEvent.setup();
    renderPage();

    await user.upload(
      await screen.findByLabelText('Choose a Dala Safe JSON file'),
      tripFile([makeTrip('trip-b')]),
    );

    expect(await screen.findByTestId('storage-problem')).toHaveTextContent(
      'Local storage is full. Export or delete some trips to continue.',
    );
  });

  it('shows safe messaging when stored data is corrupted', async () => {
    window.localStorage.setItem(
      STORAGE_KEYS.settings,
      envelope({ language: 'en', units: 'metric', onboardingComplete: false }),
    );
    window.localStorage.setItem(STORAGE_KEYS.trips, '{not-valid-json');

    renderPage();

    const alert = await screen.findByTestId('storage-problem');
    expect(alert).toHaveTextContent('Some locally stored data could not be read and was skipped.');
    expect(screen.getByRole('button', { name: 'Export all trips' })).toBeDisabled();
  });
});
