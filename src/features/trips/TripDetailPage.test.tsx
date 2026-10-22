import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18nProvider } from '../../i18n';
import { TripsProvider } from '../../data/TripsProvider';
import { STORAGE_KEYS, writeEnvelope } from '../../data/storage';
import { createTrip } from '../../domain/trip';
import type { Trip } from '../../domain/types';
import { TripDetailPage } from './TripDetailPage';

function seedLanguage() {
  writeEnvelope(window.localStorage, STORAGE_KEYS.settings, {
    language: 'en',
    units: 'metric',
    onboardingComplete: true,
  });
}

function seedTrip(overrides: Partial<Trip> = {}): Trip {
  const base = createTrip({
    name: 'Kolsai weekend',
    destination: 'Kolsai Lakes',
    departureAt: '2027-05-01T06:00:00.000Z',
    returnAt: '2027-05-01T18:00:00.000Z',
    groupSize: 3,
  });
  const trip = { ...base, ...overrides };
  writeEnvelope(window.localStorage, STORAGE_KEYS.trips, [trip]);
  return trip;
}

function renderDetail(tripId: string) {
  return render(
    <I18nProvider>
      <TripsProvider>
        <MemoryRouter initialEntries={[`/trips/${tripId}`]}>
          <Routes>
            <Route path="/trips/:tripId" element={<TripDetailPage />} />
            <Route path="/trips" element={<p>Trip list</p>} />
          </Routes>
        </MemoryRouter>
      </TripsProvider>
    </I18nProvider>,
  );
}

function readStoredTrip(): Trip {
  const raw = window.localStorage.getItem(STORAGE_KEYS.trips);
  const parsed = JSON.parse(raw ?? '{}') as { data?: Trip[] };
  const trip = parsed.data?.[0];
  if (!trip) throw new Error('No stored trip');
  return trip;
}

describe('TripDetailPage', () => {
  beforeEach(() => {
    seedLanguage();
  });

  it('shows a not-found state with a back link', () => {
    renderDetail('does-not-exist');

    expect(screen.getByRole('heading', { name: 'Trip not found' })).toBeInTheDocument();
    expect(screen.getByText('It may have been deleted on this device.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to trips' })).toHaveAttribute('href', '/trips');
  });

  it('renders trip details, progress and feature links', () => {
    const trip = seedTrip();
    renderDetail(trip.id);

    expect(screen.getByRole('heading', { name: 'Kolsai weekend' })).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Checklist progress' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Checklist' })).toHaveAttribute('href', `/trips/${trip.id}/checklist`);
    expect(screen.getByRole('link', { name: 'Safety plan' })).toHaveAttribute('href', `/trips/${trip.id}/plan`);
    expect(screen.getAllByRole('link', { name: 'Readiness guidance' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Share plan' })).toHaveAttribute('href', `/trips/${trip.id}/share`);
    expect(screen.getByRole('link', { name: 'Return reminder' })).toHaveAttribute('href', `/trips/${trip.id}/reminder`);
    expect(screen.getByRole('link', { name: 'Route (GPX)' })).toHaveAttribute('href', `/trips/${trip.id}/route`);
    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', `/trips/${trip.id}/edit`);
  });

  it('completes and reopens a trip through setStatus', () => {
    const trip = seedTrip();
    renderDetail(trip.id);

    fireEvent.click(screen.getByRole('button', { name: 'Mark completed' }));
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(readStoredTrip().status).toBe('completed');

    fireEvent.click(screen.getByRole('button', { name: 'Reopen' }));
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(readStoredTrip().status).toBe('draft');
  });

  it('deletes the trip after confirmation and returns to the list', () => {
    const trip = seedTrip();
    renderDetail(trip.id);

    fireEvent.click(screen.getByRole('button', { name: 'Delete trip' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete trip' }));

    expect(screen.getByText('Trip list')).toBeInTheDocument();
    const raw = window.localStorage.getItem(STORAGE_KEYS.trips);
    const parsed = JSON.parse(raw ?? '{}') as { data?: Trip[] };
    expect(parsed.data ?? []).toHaveLength(0);
  });
});
