import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { I18nProvider } from '../../i18n';
import { TripsProvider } from '../../data/TripsProvider';
import { STORAGE_KEYS } from '../../data/storage';
import { toLocalInputValue } from '../../domain/trip';
import type { Trip } from '../../domain/types';
import { TripsPage } from './TripsPage';
import { TripFormPage } from './TripFormPage';
import { TripDetailPage } from './TripDetailPage';

function seedLanguage() {
  window.localStorage.setItem(
    STORAGE_KEYS.settings,
    JSON.stringify({ version: 1, savedAt: new Date().toISOString(), data: { language: 'en', units: 'metric', onboardingComplete: true } }),
  );
}

function renderApp(initialEntry: string) {
  return render(
    <I18nProvider>
      <TripsProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/trips/new" element={<TripFormPage />} />
            <Route path="/trips/:tripId" element={<TripDetailPage />} />
          </Routes>
        </MemoryRouter>
      </TripsProvider>
    </I18nProvider>,
  );
}

function readStoredTrips(): Trip[] {
  const raw = window.localStorage.getItem(STORAGE_KEYS.trips);
  const parsed = JSON.parse(raw ?? '{}') as { data?: Trip[] };
  return parsed.data ?? [];
}

function localValue(offsetHours: number): string {
  return toLocalInputValue(new Date(Date.now() + offsetHours * 3_600_000).toISOString());
}

describe('trip persistence', () => {
  it('creates a trip through the form and reloads it from storage', () => {
    seedLanguage();
    const first = renderApp('/trips/new');

    fireEvent.change(screen.getByLabelText(/Trip name/), { target: { value: 'BAL weekend' } });
    fireEvent.change(screen.getByLabelText(/Destination/), { target: { value: 'Big Almaty Lake' } });
    fireEvent.change(screen.getByLabelText(/Planned departure/), { target: { value: localValue(24) } });
    fireEvent.change(screen.getByLabelText(/Expected return/), { target: { value: localValue(30) } });
    fireEvent.change(screen.getByLabelText(/Group size/), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create trip' }));

    expect(screen.getByRole('heading', { name: 'BAL weekend' })).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();

    const stored = readStoredTrips();
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('BAL weekend');
    expect(stored[0].destination).toBe('Big Almaty Lake');
    expect(stored[0].groupSize).toBe(4);
    expect(stored[0].checklist.length).toBeGreaterThan(0);

    first.unmount();

    renderApp('/trips');
    expect(screen.getByRole('link', { name: 'BAL weekend' })).toBeInTheDocument();
    expect(screen.getByText('Big Almaty Lake')).toBeInTheDocument();
  });
});
