import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '../../i18n';
import { TripsProvider } from '../../data/TripsProvider';
import { STORAGE_KEYS, writeEnvelope } from '../../data/storage';
import { createTrip } from '../../domain/trip';
import type { Trip } from '../../domain/types';
import { evaluateGuidance } from '../safety-rules/engine';
import { getGuidanceById } from '../safety-rules/catalog';
import { SafetyPlanPage } from './SafetyPlanPage';

function seedLanguage() {
  writeEnvelope(window.localStorage, STORAGE_KEYS.settings, {
    language: 'en',
    units: 'metric',
    onboardingComplete: true,
  });
}

function seedTrip(overrides: Partial<Trip> = {}): Trip {
  const base = createTrip({
    name: 'Plan trip',
    destination: 'Big Almaty Lake',
    departureAt: '2027-06-01T06:00:00.000Z',
    returnAt: '2027-06-01T16:00:00.000Z',
    groupSize: 3,
  });
  const trip = { ...base, ...overrides };
  writeEnvelope(window.localStorage, STORAGE_KEYS.trips, [trip]);
  return trip;
}

function renderPlan(tripId: string) {
  return render(
    <I18nProvider>
      <TripsProvider>
        <MemoryRouter initialEntries={[`/trips/${tripId}/plan`]}>
          <Routes>
            <Route path="/trips/:tripId/plan" element={<SafetyPlanPage />} />
            <Route path="/trips" element={<p>Trip list</p>} />
            <Route path="/trips/:tripId" element={<p>Trip detail</p>} />
            <Route path="/trips/:tripId/guidance" element={<p>Guidance</p>} />
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

describe('SafetyPlanPage', () => {
  beforeEach(() => {
    seedLanguage();
  });

  it('shows a not-found state for a missing trip', () => {
    renderPlan('missing');
    expect(screen.getByRole('heading', { name: 'Trip not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to trips' })).toBeInTheDocument();
  });

  it('generates a plan: fills duration from the trip, persists it, and renders every section', () => {
    const trip = seedTrip();
    renderPlan(trip.id);

    expect(screen.getByText('Generate guidance and complete the checklist before sharing the plan.')).toBeInTheDocument();
    expect(screen.getByText(/not a rescue guarantee, does not monitor you/)).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Generate plan' })[0]);

    const stored = readStoredTrip();
    expect(stored.safetyPlan).not.toBeNull();
    expect(stored.safetyPlan?.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(stored.safetyPlan?.answers.durationHours).toBe(10);
    expect(screen.getByRole('status')).toHaveTextContent('Plan generated.');
    expect(screen.getByText('Trip details')).toBeInTheDocument();
    expect(screen.getByText('Big Almaty Lake')).toBeInTheDocument();
    expect(screen.getByText(/items done · \d+ required items remaining/)).toBeInTheDocument();
    expect(screen.getByText('Readiness answers')).toBeInTheDocument();
    expect(screen.getByText('Trusted contact')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Print' })).toBeInTheDocument();

    const plan = stored.safetyPlan;
    if (!plan) throw new Error('safetyPlan was not persisted');
    const expected = evaluateGuidance(plan.answers, { language: 'en' }).map((match) => match.rule.id);
    expect(plan.guidanceIds).toEqual(expected);

    const guidanceHeading = screen.getByRole('heading', { name: 'Guidance' });
    const guidanceCard = guidanceHeading.closest('section');
    expect(guidanceCard).not.toBeNull();
    const renderedGuidance = within(guidanceCard as HTMLElement).queryAllByRole('listitem');
    if (expected.length === 0) {
      expect(renderedGuidance).toHaveLength(0);
      expect(within(guidanceCard as HTMLElement).getByText(/no guidance/i)).toBeInTheDocument();
    } else {
      expect(renderedGuidance).toHaveLength(expected.length);
      for (const id of expected) {
        const rule = getGuidanceById(id);
        if (rule) {
          expect(within(guidanceCard as HTMLElement).getByText(rule.title.en)).toBeInTheDocument();
          expect(
            within(guidanceCard as HTMLElement).getAllByText(rule.source.publisher, { exact: false }).length,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  it('keeps saved trusted-contact fields when the plan is regenerated', () => {
    const base = createTrip({
      name: 'Contact trip',
      destination: 'Turgen',
      departureAt: '2027-06-02T07:00:00.000Z',
      returnAt: '2027-06-02T15:00:00.000Z',
      groupSize: 2,
    });
    const trip: Trip = {
      ...base,
      safetyPlan: {
        generatedAt: '2027-05-01T10:00:00.000Z',
        answers: base.readiness,
        guidanceIds: [],
        trustedContactName: 'Aisha',
        trustedContactPhone: '+7 700 000 00 00',
        meetingPoint: 'Trailhead car park',
        notes: 'Call before dark',
      },
    };
    seedTrip(trip);
    renderPlan(trip.id);

    expect(screen.getByText('Aisha')).toBeInTheDocument();
    expect(screen.getByText('Trailhead car park')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Generate plan' })[0]);

    const stored = readStoredTrip();
    expect(stored.safetyPlan?.trustedContactName).toBe('Aisha');
    expect(stored.safetyPlan?.trustedContactPhone).toBe('+7 700 000 00 00');
    expect(stored.safetyPlan?.meetingPoint).toBe('Trailhead car park');
    expect(stored.safetyPlan?.notes).toBe('Call before dark');
    expect(stored.safetyPlan?.generatedAt).not.toBe('2027-05-01T10:00:00.000Z');
    expect(screen.getByRole('status')).toHaveTextContent('Plan generated.');
  });

  it('opens the browser print dialog from the print action', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    const trip = seedTrip();
    renderPlan(trip.id);

    fireEvent.click(screen.getByRole('button', { name: 'Print' }));
    expect(print).toHaveBeenCalledTimes(1);
    print.mockRestore();
  });
});
