import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18nProvider } from '../../i18n';
import { TripsProvider } from '../../data/TripsProvider';
import { STORAGE_KEYS, writeEnvelope } from '../../data/storage';
import { createTrip } from '../../domain/trip';
import type { Trip } from '../../domain/types';
import { TripFormPage } from './TripFormPage';

function seedLanguage() {
  writeEnvelope(window.localStorage, STORAGE_KEYS.settings, {
    language: 'en',
    units: 'metric',
    onboardingComplete: true,
  });
}

function seedTrip(): Trip {
  const trip = createTrip({
    name: 'Existing trip',
    destination: 'Kolsai Lakes',
    departureAt: '2027-05-01T06:00:00.000Z',
    returnAt: '2027-05-01T18:00:00.000Z',
    groupSize: 2,
  });
  writeEnvelope(window.localStorage, STORAGE_KEYS.trips, [trip]);
  return trip;
}

function renderForm(path: string) {
  return render(
    <I18nProvider>
      <TripsProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/trips/new" element={<TripFormPage />} />
            <Route path="/trips/:tripId/edit" element={<TripFormPage />} />
            <Route path="/trips/:tripId" element={<p>Trip detail</p>} />
            <Route path="/trips" element={<p>Trip list</p>} />
          </Routes>
        </MemoryRouter>
      </TripsProvider>
    </I18nProvider>,
  );
}

describe('TripFormPage', () => {
  beforeEach(() => {
    seedLanguage();
  });

  it('shows validation errors and marks invalid fields', () => {
    renderForm('/trips/new');

    fireEvent.click(screen.getByRole('button', { name: 'Create trip' }));

    expect(screen.getByText('Enter a trip name.')).toBeInTheDocument();
    expect(screen.getByText('Enter a destination.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid departure date and time.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid return date and time.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Trip name/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/Destination/)).toHaveAttribute('aria-invalid', 'true');
  });

  it('flags a return time that is before departure', () => {
    renderForm('/trips/new');

    fireEvent.change(screen.getByLabelText(/Trip name/), { target: { value: 'Late return' } });
    fireEvent.change(screen.getByLabelText(/Destination/), { target: { value: 'Charyn' } });
    fireEvent.change(screen.getByLabelText(/Planned departure/), { target: { value: '2030-01-02T10:00' } });
    fireEvent.change(screen.getByLabelText(/Expected return/), { target: { value: '2030-01-02T08:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create trip' }));

    expect(screen.getByText('Return must be after departure.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Expected return/)).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows a not-found state when editing a missing trip', () => {
    renderForm('/trips/missing-trip/edit');

    expect(screen.getByRole('heading', { name: 'Trip not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to trips' })).toHaveAttribute('href', '/trips');
  });

  it('loads existing values in edit mode', () => {
    const trip = seedTrip();
    renderForm(`/trips/${trip.id}/edit`);

    expect(screen.getByLabelText(/Trip name/)).toHaveValue('Existing trip');
    expect(screen.getByLabelText(/Destination/)).toHaveValue('Kolsai Lakes');
    expect(screen.getByLabelText(/Group size/)).toHaveValue(2);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });
});
