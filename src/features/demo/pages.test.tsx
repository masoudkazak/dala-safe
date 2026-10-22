import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS, createMemoryStorage } from '../../data/storage';
import { I18nProvider } from '../../i18n';
import { DemoDetailPage } from './DemoDetailPage';
import { FutureFeaturesPage } from './FutureFeaturesPage';
import { resetDemoStorage } from './demoStorage';
import { DEMO_IDS } from './types';

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

function renderFuture() {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/future']}>
        <Routes>
          <Route path="/future" element={<FutureFeaturesPage />} />
          <Route path="/future/:demoId" element={<DemoDetailPage />} />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  );
}

function renderDetail(demoId: string): ReturnType<typeof render> {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={[`/future/${demoId}`]}>
        <Routes>
          <Route path="/future/:demoId" element={<DemoDetailPage />} />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  );
}

beforeEach(() => {
  seedEnglish();
});

describe('FutureFeaturesPage', () => {
  it('lists all seven demos with the demo banner and feature statuses', () => {
    const { container } = renderFuture();

    expect(screen.getByText(/Demo mode — sample data only/)).toBeInTheDocument();

    const hrefs = Array.from(container.querySelectorAll('a')).map((link) =>
      link.getAttribute('href'),
    );
    for (const id of DEMO_IDS) {
      expect(hrefs).toContain(`/future/${id}`);
    }

    expect(screen.getAllByText('Demo').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Requires integration').length).toBeGreaterThanOrEqual(5);
    expect(screen.getAllByText('Open demonstration')).toHaveLength(DEMO_IDS.length);
  });

  it('reset control clears the local demo storage key', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(STORAGE_KEYS.demo, 'demo-notes');

    renderFuture();
    await user.click(screen.getByRole('button', { name: 'Reset demo data' }));

    expect(window.localStorage.getItem(STORAGE_KEYS.demo)).toBeNull();
    expect(screen.getByText('Local demo data cleared on this device.')).toBeInTheDocument();
  });
});

describe('resetDemoStorage', () => {
  it('removes only the demo key from a memory-safe storage', () => {
    const storage = createMemoryStorage({
      [STORAGE_KEYS.demo]: 'demo-notes',
      [STORAGE_KEYS.trips]: 'trips',
    });

    resetDemoStorage(storage);

    expect(storage.getItem(STORAGE_KEYS.demo)).toBeNull();
    expect(storage.getItem(STORAGE_KEYS.trips)).toBe('trips');
  });
});

describe('DemoDetailPage', () => {
  for (const id of DEMO_IDS) {
    it(`renders the ${id} demo with a back link and production note`, () => {
      renderDetail(id);

      expect(screen.getByRole('link', { name: /All future features/ })).toBeInTheDocument();
      expect(screen.getByText('What production would require')).toBeInTheDocument();
      expect(screen.getAllByText('Sample data').length).toBeGreaterThan(0);
    });
  }

  it('shows a friendly not-found for an unknown demo id', () => {
    renderDetail('not-a-real-demo');

    expect(screen.getByText('This demonstration does not exist.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /All future features/ })).toBeInTheDocument();
  });
});
