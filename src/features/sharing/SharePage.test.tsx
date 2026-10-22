import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TripsProvider } from '../../data/TripsProvider';
import { STORAGE_KEYS, STORAGE_VERSION } from '../../data/storage';
import type { Trip } from '../../domain/types';
import { I18nProvider } from '../../i18n';
import { SharePage } from './SharePage';

const TRIP: Trip = {
  id: 'trip-1',
  name: 'Big Almaty Lake day hike',
  destination: 'Big Almaty Lake trail',
  departureAt: '2026-05-12T01:00:00.000Z',
  returnAt: '2026-05-12T12:00:00.000Z',
  groupSize: 4,
  notes: 'Meet at the trailhead; carry water.',
  status: 'ready',
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
  checklist: [
    {
      id: 'chk-weather',
      templateId: 'weather',
      label: { kk: 'Ауа райы', ru: 'Погода', en: 'Weather' },
      required: true,
      done: true,
      custom: false,
    },
  ],
  readiness: {
    durationHours: 11,
    groupExperience: 'some',
    connectivity: 'unreliable',
    forecastAvailable: true,
    routeType: 'marked',
  },
  safetyPlan: {
    generatedAt: '2026-05-02T00:00:00.000Z',
    answers: {
      durationHours: 11,
      groupExperience: 'some',
      connectivity: 'unreliable',
      forecastAvailable: true,
      routeType: 'marked',
    },
    guidanceIds: ['water', 'offline-map'],
    trustedContactName: 'Aigerim',
    trustedContactPhone: '+7 700 123 45 67',
    meetingPoint: 'Trailhead parking',
    notes: 'Call before leaving the city.',
  },
  track: null,
};

function writeEnvelope(key: string, data: unknown) {
  window.localStorage.setItem(
    key,
    JSON.stringify({ version: STORAGE_VERSION, savedAt: new Date().toISOString(), data }),
  );
}

function seed(trip: Trip = TRIP) {
  writeEnvelope(STORAGE_KEYS.trips, [trip]);
  writeEnvelope(STORAGE_KEYS.settings, {
    language: 'en',
    units: 'metric',
    onboardingComplete: false,
  });
}

function readStoredTrips(): Trip[] {
  const raw = window.localStorage.getItem(STORAGE_KEYS.trips);
  if (!raw) return [];
  return (JSON.parse(raw) as { data: Trip[] }).data;
}

function renderPage() {
  render(
    <MemoryRouter initialEntries={[`/trips/${TRIP.id}/share`]}>
      <I18nProvider>
        <TripsProvider>
          <Routes>
            <Route path="/trips/:tripId/share" element={<SharePage />} />
          </Routes>
        </TripsProvider>
      </I18nProvider>
    </MemoryRouter>,
  );
}

function firstPreview(): string {
  const preview = document.querySelector('pre.sharing-preview');
  return preview?.textContent ?? '';
}

function setClipboard(value: unknown) {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value });
}

function setExecCommand(value: unknown) {
  Object.defineProperty(document, 'execCommand', { configurable: true, value });
}

afterEach(() => {
  setClipboard(undefined);
  Reflect.deleteProperty(document, 'execCommand');
  Reflect.deleteProperty(navigator, 'share');
  vi.restoreAllMocks();
});

describe('SharePage', () => {
  it('generates on request only and keeps generated versus sent status explicit', async () => {
    seed();
    const user = userEvent.setup();
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });

    renderPage();

    expect(screen.getByText('Status: generated only — not delivered.')).toBeInTheDocument();
    expect(share).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Generate trusted-contact message' }));

    expect(firstPreview()).toContain('Hello Aigerim,');
    expect(firstPreview()).toContain('Big Almaty Lake trail');
    expect(firstPreview()).toContain('not an official trip registration');
    expect(firstPreview()).toContain('Generated only — not delivered');
    expect(screen.getAllByText('Status: generated only — not delivered.')).toHaveLength(2);
    expect(screen.getByText('Generated only — not delivered.')).toBeInTheDocument();
    expect(share).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Copy message — English' }));

    expect(writeText).toHaveBeenCalled();
    expect(screen.getByText('Message copied. It has not been sent.')).toBeInTheDocument();
    expect(screen.queryByText(/^Delivered$/)).toBeNull();
  });

  it('falls back to selection copying when the clipboard rejects the write', async () => {
    seed();
    const user = userEvent.setup();
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) });
    setExecCommand(vi.fn(() => true));

    renderPage();
    await user.click(screen.getByRole('button', { name: 'Generate trusted-contact message' }));
    await user.click(screen.getByRole('button', { name: 'Copy message — English' }));

    expect(screen.getByText('Message copied. It has not been sent.')).toBeInTheDocument();
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('shows manual copy guidance when automatic copying fails', async () => {
    seed();
    const user = userEvent.setup();
    setClipboard(undefined);
    setExecCommand(vi.fn(() => false));

    renderPage();
    await user.click(screen.getByRole('button', { name: 'Generate trusted-contact message' }));
    await user.click(screen.getByRole('button', { name: 'Copy message — English' }));

    expect(
      screen.getByText(
        'Automatic copying is unavailable. Select the message text and copy it manually. Nothing has been sent.',
      ),
    ).toBeInTheDocument();
  });

  it('renders Kazakh and Russian notices plus an English translation', async () => {
    seed();
    const user = userEvent.setup();

    renderPage();
    await user.click(
      screen.getByRole('button', { name: 'Generate trip notice (Kazakh + Russian)' }),
    );

    const previews = Array.from(document.querySelectorAll('pre.sharing-preview')).map(
      (node) => node.textContent ?? '',
    );
    expect(previews).toHaveLength(3);
    expect(previews[0]).toContain('Сапар туралы хабарлама');
    expect(previews[1]).toContain('Сообщение о поездке');
    expect(previews[2]).toContain('Trip notice');
  });

  it('does not auto-share and copies as a fallback when native sharing is unavailable', async () => {
    seed();
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    Reflect.deleteProperty(navigator, 'share');

    renderPage();
    await user.click(screen.getByRole('button', { name: 'Generate trusted-contact message' }));
    expect(writeText).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Share… — English' }));

    expect(writeText).toHaveBeenCalled();
    expect(
      screen.getByText(
        'Native sharing is not available. The message was copied instead — it has not been sent.',
      ),
    ).toBeInTheDocument();
  });

  it('shares only after an explicit click and never claims delivery', async () => {
    seed();
    const user = userEvent.setup();
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });

    renderPage();
    await user.click(screen.getByRole('button', { name: 'Generate trusted-contact message' }));
    expect(share).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Share… — English' }));

    expect(share).toHaveBeenCalledTimes(1);
    expect(screen.getByText('The share dialog closed. Delivery is not confirmed.')).toBeInTheDocument();
  });

  it('persists contact fields into the safety plan while preserving other fields', async () => {
    seed();
    const user = userEvent.setup();

    renderPage();

    const name = screen.getByLabelText('Contact name');
    const phone = screen.getByLabelText('Contact phone');
    const meetingPoint = screen.getByLabelText('Meeting point');

    await user.clear(name);
    await user.type(name, 'Dana');
    await user.clear(phone);
    await user.type(phone, '+7 701 555 44 33');
    await user.clear(meetingPoint);
    await user.type(meetingPoint, 'Bus stop');
    await user.click(screen.getByRole('button', { name: 'Save contact details' }));

    const [stored] = readStoredTrips();
    expect(stored.safetyPlan?.trustedContactName).toBe('Dana');
    expect(stored.safetyPlan?.trustedContactPhone).toBe('+7 701 555 44 33');
    expect(stored.safetyPlan?.meetingPoint).toBe('Bus stop');
    expect(stored.safetyPlan?.notes).toBe('Call before leaving the city.');
    expect(stored.safetyPlan?.guidanceIds).toEqual(['water', 'offline-map']);
    expect(screen.getByText('Contact details saved on this device.')).toBeInTheDocument();
  });

  it('uses the selected message language for generated content', async () => {
    seed();
    const user = userEvent.setup();

    renderPage();
    await user.selectOptions(screen.getByLabelText('Message language'), 'ru');
    await user.click(screen.getByRole('button', { name: 'Generate trusted-contact message' }));

    expect(firstPreview()).toContain('Направление: Big Almaty Lake trail');
    expect(firstPreview()).toContain('Только сформировано — не доставлено');
  });

  it('builds an email draft and exposes a mailto link only after generation', async () => {
    seed();
    const user = userEvent.setup();

    renderPage();
    expect(screen.queryByRole('link', { name: 'Open email draft' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Generate email draft' }));

    expect(screen.getByText(/^Subject: Dala Safe trip plan:/)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Open email draft' });
    expect(link.getAttribute('href')).toMatch(/^mailto:\?subject=/);
    expect(screen.getByText(/Opening the draft does not send it/)).toBeInTheDocument();
    expect(firstPreview()).toContain('Generated only — not delivered');
  });
});
