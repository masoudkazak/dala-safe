import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { I18nProvider } from '../../i18n';
import { TripsProvider } from '../../data/TripsProvider';
import { STORAGE_KEYS, writeEnvelope } from '../../data/storage';
import { EMPTY_READINESS, createTrip } from '../../domain/trip';
import type { Language, SafetyPlan, Trip } from '../../domain/types';
import { GuidancePage } from './GuidancePage';

function seedLanguage(language: Language) {
  writeEnvelope(window.localStorage, STORAGE_KEYS.settings, {
    language,
    units: 'metric',
    onboardingComplete: true,
  });
}

function seedTrip(overrides: Partial<Trip> = {}): Trip {
  const base = createTrip({
    name: 'Test trip',
    destination: 'Big Almaty Lake',
    departureAt: '2026-10-21T06:00:00.000Z',
    returnAt: '2026-10-21T12:00:00.000Z',
    groupSize: 3,
  });
  const trip: Trip = { ...base, ...overrides };
  writeEnvelope(window.localStorage, STORAGE_KEYS.trips, [trip]);
  return trip;
}

function renderGuidance(tripId: string) {
  return render(
    <I18nProvider>
      <TripsProvider>
        <MemoryRouter initialEntries={[`/trips/${tripId}/guidance`]}>
          <Routes>
            <Route path="/trips/:tripId/guidance" element={<GuidancePage />} />
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

describe('GuidancePage', () => {
  it('prefills readiness answers and shows recommendations with reasons and sources', () => {
    seedLanguage('en');
    const trip = seedTrip({
      readiness: {
        durationHours: 7,
        groupExperience: 'first-time',
        connectivity: 'none',
        forecastAvailable: false,
        routeType: 'unmarked',
      },
    });

    renderGuidance(trip.id);

    expect(screen.getByRole('heading', { name: 'Readiness guidance' })).toBeInTheDocument();
    expect(screen.getByLabelText('Expected duration (hours)')).toHaveValue(7);
    expect(screen.getByLabelText('Group experience')).toHaveValue('first-time');
    expect(screen.getByLabelText('Expected connectivity')).toHaveValue('none');
    expect(screen.getByLabelText('Route type')).toHaveValue('unmarked');
    expect(screen.getByText('No signal on an unmarked route')).toBeInTheDocument();
    expect(screen.getAllByText('Why this recommendation').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Last verified/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Human review required').length).toBeGreaterThan(0);
    expect(screen.queryByText(/Some answers are missing/)).not.toBeInTheDocument();
  });

  it('warns about missing inputs and saves answers while preserving trusted-contact fields', () => {
    seedLanguage('en');
    const previousPlan: SafetyPlan = {
      generatedAt: '2026-01-01T00:00:00.000Z',
      answers: { ...EMPTY_READINESS },
      guidanceIds: [],
      trustedContactName: 'Aigerim',
      trustedContactPhone: '+7 700 000 00 00',
      meetingPoint: 'Park entrance',
      notes: 'Old notes',
    };
    const trip = seedTrip({ safetyPlan: previousPlan });

    renderGuidance(trip.id);

    expect(screen.getByText('Some answers are missing. Conservative defaults are used.')).toBeInTheDocument();
    expect(screen.getByText(/Input completeness: 0 of 5/)).toBeInTheDocument();
    expect(screen.getByText(/This is not a safety score/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Expected duration (hours)'), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText('Group experience'), { target: { value: 'first-time' } });
    fireEvent.change(screen.getByLabelText('Expected connectivity'), { target: { value: 'none' } });
    fireEvent.change(screen.getByLabelText('Forecast checked before departure'), { target: { value: 'no' } });
    fireEvent.change(screen.getByLabelText('Route type'), { target: { value: 'unmarked' } });

    fireEvent.click(screen.getByRole('button', { name: 'Update recommendations' }));

    expect(screen.getByText('Guidance saved.')).toBeInTheDocument();

    const saved = readStoredTrip();
    expect(saved.readiness.durationHours).toBe(8);
    expect(saved.readiness.connectivity).toBe('none');
    expect(saved.safetyPlan?.trustedContactName).toBe('Aigerim');
    expect(saved.safetyPlan?.trustedContactPhone).toBe('+7 700 000 00 00');
    expect(saved.safetyPlan?.meetingPoint).toBe('Park entrance');
    expect(saved.safetyPlan?.notes).toBe('Old notes');
    expect(saved.safetyPlan?.answers.durationHours).toBe(8);
    expect(saved.safetyPlan?.guidanceIds).toContain('no-signal-unmarked-route');
    expect(saved.safetyPlan?.generatedAt).not.toBe(previousPlan.generatedAt);
  });

  it('shows the no-match state for complete low-risk answers', () => {
    seedLanguage('en');
    const trip = seedTrip({
      readiness: {
        durationHours: 3,
        groupExperience: 'some',
        connectivity: 'good',
        forecastAvailable: true,
        routeType: 'marked',
      },
    });

    renderGuidance(trip.id);

    expect(screen.getByText('No specific recommendations for the current answers.')).toBeInTheDocument();
    expect(screen.getByText(/Input completeness: 5 of 5/)).toBeInTheDocument();
    expect(screen.queryByText(/Some answers are missing/)).not.toBeInTheDocument();
  });

  it('shows a not-found state for a nonexistent trip', () => {
    seedLanguage('en');
    renderGuidance('missing-trip');

    expect(screen.getByRole('heading', { name: 'Trip not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to trips' })).toHaveAttribute('href', '/trips');
  });

  it('renders in Kazakh without falling back to raw keys', () => {
    seedLanguage('kk');
    const trip = seedTrip({
      readiness: {
        durationHours: 12,
        groupExperience: 'first-time',
        connectivity: 'none',
        forecastAvailable: false,
        routeType: 'unmarked',
      },
    });

    renderGuidance(trip.id);

    expect(screen.getByRole('heading', { name: 'Дайындық нұсқаулығы' })).toBeInTheDocument();
    expect(screen.getByText('Белгіленбеген маршрутта байланыс жоқ')).toBeInTheDocument();
    expect(screen.queryByText(/^safety\./)).not.toBeInTheDocument();
  });
});
