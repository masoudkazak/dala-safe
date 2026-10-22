import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '../../i18n';
import { EmergencyPage } from './EmergencyPage';

const TEL_NUMBERS = ['112', '101', '102', '103', '104', '109'];

function seedEnglish() {
  window.localStorage.setItem(
    'dala-safe:v1:settings',
    JSON.stringify({
      version: 1,
      savedAt: new Date().toISOString(),
      data: { language: 'en', units: 'metric', onboardingComplete: false },
    }),
  );
}

function renderPage(props: { demo?: boolean } = {}) {
  return render(
    <I18nProvider>
      <EmergencyPage {...props} />
    </I18nProvider>,
  );
}

function mockGeolocationSuccess(accuracy = 35) {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: vi.fn(
        (success: (position: { coords: { latitude: number; longitude: number; accuracy: number } }) => void) => {
          success({ coords: { latitude: 43.23895, longitude: 76.88971, accuracy } });
        },
      ),
    },
  });
}

let originalGeolocation: PropertyDescriptor | undefined;
let originalClipboard: PropertyDescriptor | undefined;
let originalShare: PropertyDescriptor | undefined;
let originalExecCommand: PropertyDescriptor | undefined;

beforeEach(() => {
  seedEnglish();
  originalGeolocation = Object.getOwnPropertyDescriptor(navigator, 'geolocation');
  originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  originalShare = Object.getOwnPropertyDescriptor(navigator, 'share');
  originalExecCommand = Object.getOwnPropertyDescriptor(document, 'execCommand');
});

afterEach(() => {
  restore(navigator as object, 'geolocation', originalGeolocation);
  restore(navigator as object, 'clipboard', originalClipboard);
  restore(navigator as object, 'share', originalShare);
  restore(document as object, 'execCommand', originalExecCommand);
  vi.restoreAllMocks();
});

function restore(target: object, key: string, descriptor: PropertyDescriptor | undefined) {
  if (descriptor) {
    Object.defineProperty(target, key, descriptor);
  } else {
    Reflect.deleteProperty(target, key);
  }
}

describe('EmergencyPage contact actions', () => {
  it('keeps every real tel: link visible and enabled in demo mode', () => {
    const { container } = renderPage({ demo: true });

    for (const number of TEL_NUMBERS) {
      const link = container.querySelector(`a[href="tel:${number}"]`);
      expect(link).not.toBeNull();
      expect(link).toBeVisible();
      expect(link).not.toHaveAttribute('aria-disabled', 'true');
    }

    expect(screen.getByText(/Demo mode never blocks or hides them/)).toBeInTheDocument();
  });

  it('keeps tel: links visible while offline', () => {
    const { container } = renderPage();

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByText('Offline')).toBeInTheDocument();
    for (const number of TEL_NUMBERS) {
      expect(container.querySelector(`a[href="tel:${number}"]`)).not.toBeNull();
    }
  });

  it('shows source, last-verified date and review status for the numbers', () => {
    renderPage();

    expect(screen.getByText('Almaty city only')).toBeInTheDocument();
    expect(screen.getAllByText('Needs human review').length).toBeGreaterThanOrEqual(TEL_NUMBERS.length);
    expect(screen.getAllByText(/Last verified/).length).toBeGreaterThanOrEqual(TEL_NUMBERS.length);
    expect(screen.getAllByText('2026-10-20').length).toBeGreaterThanOrEqual(TEL_NUMBERS.length);

    const sourceLinks = screen.getAllByRole('link', { name: 'egov.kz' });
    expect(sourceLinks.length).toBeGreaterThanOrEqual(5);
    expect(sourceLinks[0]).toHaveAttribute('href', expect.stringContaining('egov.kz'));
  });

  it('renders the phrasebook in Kazakh, Russian and English', () => {
    renderPage();

    expect(screen.getByText('Адасып қалдым.')).toBeInTheDocument();
    expect(screen.getByText('Я заблудился.')).toBeInTheDocument();
    expect(screen.getByText('I am lost.')).toBeInTheDocument();
  });
});

describe('EmergencyPage coordinates', () => {
  it('shows granted coordinates and the rescue-accuracy limitation', async () => {
    mockGeolocationSuccess(35);
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Get my coordinates' }));

    expect(await screen.findByText('43.23895')).toBeInTheDocument();
    expect(screen.getByText('76.88971')).toBeInTheDocument();
    expect(screen.getByText('±35 m')).toBeInTheDocument();
    expect(screen.getByText(/do not guarantee accuracy sufficient for rescue/)).toBeInTheDocument();
    expect(screen.getByText(/does not send them to rescuers/)).toBeInTheDocument();
  });

  it('warns about poor accuracy', async () => {
    mockGeolocationSuccess(350);
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Get my coordinates' }));

    expect(await screen.findByText(/Accuracy is poor/)).toBeInTheDocument();
  });

  it('uses the legacy copy fallback when the Clipboard API is unavailable', async () => {
    mockGeolocationSuccess(35);
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand });

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Get my coordinates' }));
    await screen.findByText('43.23895');
    await user.click(screen.getByRole('button', { name: 'Copy coordinates' }));

    await waitFor(() => {
      expect(screen.getByText(/Coordinates copied/)).toBeInTheDocument();
    });
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('falls back to copying when native sharing is unavailable', async () => {
    mockGeolocationSuccess(35);
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Get my coordinates' }));
    await screen.findByText('43.23895');
    await user.click(screen.getByRole('button', { name: 'Share coordinates' }));

    await waitFor(() => {
      expect(screen.getByText(/Coordinates were copied instead/)).toBeInTheDocument();
    });
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('43.23895, 76.88971'));
  });

  it('does not claim that sharing delivered the coordinates', async () => {
    mockGeolocationSuccess(35);
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Get my coordinates' }));
    await screen.findByText('43.23895');
    await user.click(screen.getByRole('button', { name: 'Share coordinates' }));

    await waitFor(() => {
      expect(screen.getByText(/cannot confirm that anyone received/)).toBeInTheDocument();
    });
  });
});
