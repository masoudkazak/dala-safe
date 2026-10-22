import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18nProvider } from '../../i18n';
import { TripsProvider } from '../../data/TripsProvider';
import { STORAGE_KEYS, writeEnvelope } from '../../data/storage';
import { createChecklistItems, createTrip } from '../../domain/trip';
import type { ChecklistItem, Trip } from '../../domain/types';
import { ChecklistPage } from './ChecklistPage';

function seedLanguage() {
  writeEnvelope(window.localStorage, STORAGE_KEYS.settings, {
    language: 'en',
    units: 'metric',
    onboardingComplete: true,
  });
}

function seedTrip(overrides: Partial<Trip> = {}): Trip {
  const base = createTrip({
    name: 'Checklist trip',
    destination: 'Turgen',
    departureAt: '2027-06-01T06:00:00.000Z',
    returnAt: '2027-06-01T16:00:00.000Z',
    groupSize: 2,
  });
  const trip = { ...base, ...overrides };
  writeEnvelope(window.localStorage, STORAGE_KEYS.trips, [trip]);
  return trip;
}

function renderChecklist(tripId: string) {
  return render(
    <I18nProvider>
      <TripsProvider>
        <MemoryRouter initialEntries={[`/trips/${tripId}/checklist`]}>
          <Routes>
            <Route path="/trips/:tripId/checklist" element={<ChecklistPage />} />
            <Route path="/trips" element={<p>Trip list</p>} />
          </Routes>
        </MemoryRouter>
      </TripsProvider>
    </I18nProvider>,
  );
}

function readStoredChecklist(): ChecklistItem[] {
  const raw = window.localStorage.getItem(STORAGE_KEYS.trips);
  const parsed = JSON.parse(raw ?? '{}') as { data?: Trip[] };
  const trip = parsed.data?.[0];
  if (!trip) throw new Error('No stored trip');
  return trip.checklist;
}

describe('ChecklistPage', () => {
  beforeEach(() => {
    seedLanguage();
  });

  it('shows a not-found state for a missing trip', () => {
    renderChecklist('missing');
    expect(screen.getByRole('heading', { name: 'Trip not found' })).toBeInTheDocument();
  });

  it('persists a toggle, adds and removes a custom item, and resets progress', () => {
    const trip = seedTrip();
    renderChecklist(trip.id);

    expect(screen.getByRole('progressbar', { name: 'Completed' })).toBeInTheDocument();
    expect(screen.getByText('7 required items remaining')).toBeInTheDocument();

    const firstItem = screen.getByLabelText('Weather forecast checked');
    fireEvent.click(firstItem);
    expect(readStoredChecklist().find((item) => item.templateId === 'weather-checked')?.done).toBe(true);
    expect(screen.getByText('6 required items remaining')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('New checklist item'), {
      target: { value: 'Bring the permit copy' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));
    expect(screen.getByText('Bring the permit copy')).toBeInTheDocument();
    expect(readStoredChecklist().some((item) => item.custom && item.label.en === 'Bring the permit copy')).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Remove item: Bring the permit copy' }));
    expect(screen.queryByText('Bring the permit copy')).not.toBeInTheDocument();
    expect(readStoredChecklist().some((item) => item.custom)).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Reset checklist' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('All items will be unmarked. Custom items are kept.')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reset checklist' }));

    expect(readStoredChecklist().every((item) => !item.done)).toBe(true);
    expect(screen.getByText('Checklist progress reset.')).toBeInTheDocument();
    expect(screen.getByText('7 required items remaining')).toBeInTheDocument();
  });

  it('shows the all-done alert when every item is complete', () => {
    const checklist = createChecklistItems().map((item) => ({ ...item, done: true }));
    const trip = seedTrip({ checklist });
    renderChecklist(trip.id);

    expect(screen.getByText('All required items are complete.')).toBeInTheDocument();
    expect(screen.getByText('0 required items remaining')).toBeInTheDocument();
  });
});
