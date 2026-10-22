import { useEffect, useRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { TripsProvider, useTrips } from '../../data/TripsProvider';
import { STORAGE_KEYS, STORAGE_VERSION } from '../../data/storage';
import type { Trip } from '../../domain/types';
import { I18nProvider } from '../../i18n';
import { generateIcs, validateIcs, validateIcsContent } from '../calendar/ics';
import { TourPage } from './TourPage';
import { TOUR_TOTAL, buildTourMessage, clampStep, createSampleTrip, stepIdAt } from './tourData';
import { createTourState, normalizeTourState, tourReducer } from './tourState';

const STEP_TITLES = [
  'The problem',
  'Purpose and audience',
  'Language and accessibility',
  'Create a trip',
  'Checklist and safety plan',
  'Trusted contact and sharing',
  'Return reminder',
  'Emergency screen',
  'Offline limits',
  'Regional information and future capabilities',
  'Roadmap and expected impact',
];

function seedEnglish() {
  window.localStorage.setItem(
    STORAGE_KEYS.settings,
    JSON.stringify({
      version: STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      data: { language: 'en', units: 'metric', onboardingComplete: false },
    }),
  );
}

function readStoredTrips(): Trip[] {
  const raw = window.localStorage.getItem(STORAGE_KEYS.trips);
  if (!raw) return [];
  return (JSON.parse(raw) as { data: Trip[] }).data;
}

function PathProbe() {
  const location = useLocation();
  return <div data-testid="path">{location.pathname}</div>;
}

function UserTripProbe() {
  const { trips, createTrip } = useTrips();
  const created = useRef(false);
  useEffect(() => {
    if (created.current) return;
    created.current = true;
    createTrip({
      name: 'My real trip',
      destination: 'Kolsai lakes',
      departureAt: '2026-07-01T05:00:00.000Z',
      returnAt: '2026-07-02T18:00:00.000Z',
      groupSize: 2,
    });
  }, [createTrip]);
  return <div data-testid="user-trips">{`${trips.length}:${trips[0]?.name ?? ''}`}</div>;
}

function renderTour() {
  return render(
    <MemoryRouter initialEntries={['/tour']}>
      <I18nProvider>
        <TripsProvider>
          <UserTripProbe />
          <Routes>
            <Route path="/tour" element={<TourPage />} />
            <Route path="/" element={<PathProbe />} />
          </Routes>
        </TripsProvider>
      </I18nProvider>
    </MemoryRouter>,
  );
}

async function clickNext(user: ReturnType<typeof userEvent.setup>, times: number) {
  for (let index = 0; index < times; index += 1) {
    await user.click(screen.getByRole('button', { name: 'Next' }));
  }
}

describe('TourPage flow', () => {
  it('renders all 11 steps in order and reaches the end', async () => {
    seedEnglish();
    const user = userEvent.setup();
    renderTour();

    expect(screen.getByText('Step 1 of 11')).toBeInTheDocument();

    const seen: string[] = [];
    for (let index = 0; index < TOUR_TOTAL; index += 1) {
      const heading = screen.getByRole('heading', { level: 1 });
      seen.push(heading.textContent ?? '');
      if (index < TOUR_TOTAL - 1) {
        await user.click(screen.getByRole('button', { name: 'Next' }));
      }
    }

    expect(seen).toEqual(STEP_TITLES);
    expect(screen.getByText('Step 11 of 11')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Finish tour' })).toBeInTheDocument();
  });

  it('respects back/next boundaries, moves focus to the step heading and exits at the end', async () => {
    seedEnglish();
    const user = userEvent.setup();
    renderTour();

    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();

    const next = screen.getByRole('button', { name: 'Next' });
    next.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByText('Step 2 of 11')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Step 1 of 11')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();

    await clickNext(user, TOUR_TOTAL - 1);
    expect(screen.getByText('Step 11 of 11')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Finish tour' }));
    expect(screen.getByTestId('path')).toHaveTextContent('/');
  });

  it('restores the tour-local trip and checklist on reset and clears the demo key', async () => {
    seedEnglish();
    window.localStorage.setItem(
      STORAGE_KEYS.demo,
      JSON.stringify({ version: STORAGE_VERSION, savedAt: new Date().toISOString(), data: { open: true } }),
    );
    const user = userEvent.setup();
    renderTour();

    await clickNext(user, 3);
    expect(screen.getByText('Step 4 of 11')).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Trip name/) as HTMLInputElement;
    expect(nameInput.value).toBe('Big Almaty Lake day hike');
    await user.clear(nameInput);
    await user.type(nameInput, 'Edited inside the tour');

    await user.click(screen.getByRole('button', { name: 'Next' }));
    const weatherItem = screen.getByLabelText('Weather forecast checked') as HTMLInputElement;
    expect(weatherItem.checked).toBe(true);
    await user.click(weatherItem);
    expect(weatherItem.checked).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Reset tour' }));
    expect(
      screen.getByText('Sample trip and checklist restored to the demo starting point.'),
    ).toBeInTheDocument();

    const restoredItem = screen.getByLabelText('Weather forecast checked') as HTMLInputElement;
    expect(restoredItem.checked).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect((screen.getByLabelText(/Trip name/) as HTMLInputElement).value).toBe('Big Almaty Lake day hike');
    expect(window.localStorage.getItem(STORAGE_KEYS.demo)).toBeNull();
  });

  it('never changes a real trip created in TripsProvider while the whole tour runs', async () => {
    seedEnglish();
    const user = userEvent.setup();
    renderTour();

    await waitFor(() => expect(screen.getByTestId('user-trips')).toHaveTextContent('1:My real trip'));

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Small group' }));

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Русский' }));

    await user.click(screen.getByRole('button', { name: 'Next' }));
    const nameInput = screen.getByLabelText(/Trip name/) as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, 'Tour-only edit');

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByLabelText('Weather forecast checked'));

    await clickNext(user, 4);
    await user.click(screen.getByRole('button', { name: 'Needs a connection' }));

    await clickNext(user, 2);
    await user.click(screen.getByRole('button', { name: 'Reset tour' }));

    expect(screen.getByTestId('user-trips')).toHaveTextContent('1:My real trip');
    const stored = readStoredTrips();
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('My real trip');
    expect(JSON.stringify(stored)).not.toContain('tour-sample-trip');
  });

  it('shows the demo-mode banner at every step', async () => {
    seedEnglish();
    const user = userEvent.setup();
    renderTour();

    for (let index = 0; index < TOUR_TOTAL; index += 1) {
      const banner = screen.getByRole('note', { name: 'Tour demo mode' });
      expect(banner).toHaveTextContent('Tour demo mode');
      expect(banner).toHaveTextContent('never starts a real call, SMS, location share or alert');
      if (index < TOUR_TOTAL - 1) {
        await user.click(screen.getByRole('button', { name: 'Next' }));
      }
    }
  });

  it('keeps real emergency tel: links and the real phrasebook in the emergency step', async () => {
    seedEnglish();
    const user = userEvent.setup();
    const { container } = renderTour();

    await clickNext(user, 7);
    expect(screen.getByText('Step 8 of 11')).toBeInTheDocument();

    const link = container.querySelector('a[href="tel:112"]');
    expect(link).not.toBeNull();
    expect(link).toBeVisible();
    expect(link).not.toHaveAttribute('aria-disabled', 'true');

    expect(screen.getByText('I am lost.')).toBeInTheDocument();
    expect(screen.getByText('Я заблудился.')).toBeInTheDocument();
    expect(screen.getByText('Адасып қалдым.')).toBeInTheDocument();
  });
});

describe('tour state machine', () => {
  const now = new Date('2026-06-01T10:00:00.000Z');

  it('clamps unknown step values and never throws on unknown state or actions', () => {
    expect(clampStep(undefined)).toBe(0);
    expect(clampStep(Number.NaN)).toBe(0);
    expect(clampStep(-5)).toBe(0);
    expect(clampStep(99)).toBe(TOUR_TOTAL - 1);
    expect(stepIdAt(999)).toBe('roadmap');

    const base = createTourState('en', now);
    expect(() => tourReducer(base, { type: 'mystery' } as never)).not.toThrow();
    expect(tourReducer(base, { type: 'mystery' } as never)).toEqual(base);

    expect(normalizeTourState(null).currentStep).toBe(0);
    expect(normalizeTourState(undefined).sampleTrip.id).toBe('tour-sample-trip');
    expect(normalizeTourState({ currentStep: 42 }).currentStep).toBe(TOUR_TOTAL - 1);
    expect(normalizeTourState({ currentStep: -4 }).currentStep).toBe(0);
    expect(
      normalizeTourState({ currentStep: 1.9, language: 'en', sampleTrip: { bogus: true } }).sampleTrip.id,
    ).toBe('tour-sample-trip');

    expect(tourReducer({ currentStep: 99 } as never, { type: 'next' }).currentStep).toBe(TOUR_TOTAL - 1);
    expect(tourReducer({ currentStep: -4 } as never, { type: 'back' }).currentStep).toBe(0);
  });

  it('generates a deterministic sample message for an injected now', () => {
    const first = buildTourMessage(createSampleTrip('en', now), 'en', now);
    const second = buildTourMessage(createSampleTrip('en', now), 'en', now);

    expect(first.body).toBe(second.body);
    expect(first.id).toBe(second.id);
    expect(first.generatedAt).toBe(now.toISOString());

    const later = buildTourMessage(createSampleTrip('en', now), 'en', new Date('2026-06-02T10:00:00.000Z'));
    expect(later.body).not.toBe(first.body);
  });

  it('builds a valid calendar file for the sample trip', () => {
    const trip = createSampleTrip('en', now);
    expect(validateIcs(trip, { now }).valid).toBe(true);
    const content = generateIcs(trip, { now });
    expect(validateIcsContent(content)).toEqual([]);
    expect(content).toContain('BEGIN:VALARM');
  });
});
