import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18nProvider } from '../../i18n';
import { DEMO_REGISTRY } from './registry';
import { DEMO_IDS, type DemoId } from './types';

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

function renderDemo(id: DemoId) {
  const Demo = DEMO_REGISTRY[id].component;
  return render(
    <I18nProvider>
      <MemoryRouter>
        <Demo />
      </MemoryRouter>
    </I18nProvider>,
  );
}

beforeEach(() => {
  seedEnglish();
});

describe('every future-feature demo', () => {
  for (const id of DEMO_IDS) {
    it(`renders ${id} with a feature status badge and a sample-data disclosure`, () => {
      const { container } = renderDemo(id);
      expect(container).toBeInTheDocument();

      const label = DEMO_REGISTRY[id].state === 'demo' ? 'Demo' : 'Requires integration';
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
      expect(screen.getAllByText('Sample data').length).toBeGreaterThan(0);
    });
  }
});

describe('route planning demo', () => {
  it('recomputes distance readouts from edited elevation samples', async () => {
    const user = userEvent.setup();
    renderDemo('route-planning');

    expect(screen.getByText('Total ascent')).toBeInTheDocument();

    const input = screen.getByLabelText('Elevation samples (metres, comma-separated)');
    await user.clear(input);
    await user.type(input, '100, 200, 300');

    expect(screen.getByText('200 m')).toBeInTheDocument();
    expect(screen.getByText('300 m')).toBeInTheDocument();
    expect(screen.getByText('100 m')).toBeInTheDocument();
  });

  it('switches between the three sample routes', async () => {
    const user = userEvent.setup();
    renderDemo('route-planning');

    await user.selectOptions(screen.getByLabelText('Sample route'), 'talgar');
    expect(screen.getByRole('option', { name: 'Talgar traverse (sample)' })).toBeInTheDocument();
    const input = screen.getByLabelText('Elevation samples (metres, comma-separated)') as HTMLInputElement;
    expect(input.value).toContain('1800');
  });

  it('rejects malformed elevation input with a visible error', async () => {
    const user = userEvent.setup();
    renderDemo('route-planning');

    const input = screen.getByLabelText('Elevation samples (metres, comma-separated)');
    await user.clear(input);
    await user.type(input, '1, 2, x');

    expect(
      screen.getByText('Enter 2 to 40 numbers separated by commas (each between -100 and 9000).'),
    ).toBeInTheDocument();
  });
});

describe('weather demo', () => {
  it('shows the sample / not a live forecast banner with the official-source note', () => {
    renderDemo('weather');

    expect(screen.getByText(/not a live forecast/)).toBeInTheDocument();
    expect(screen.getAllByText(/Kazhydromet/).length).toBeGreaterThan(0);
  });

  it('switches days and updates readings and hazard rows', async () => {
    const user = userEvent.setup();
    renderDemo('weather');

    expect(screen.getByText(/High 8/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Day 3 (sample)' }));

    expect(screen.getByText(/High 3/)).toBeInTheDocument();
    expect(screen.getByText('Avalanche risk (sample)')).toBeInTheDocument();
    expect(screen.getByText('Wind and precipitation (sample)')).toBeInTheDocument();
  });
});

describe('regional risk demo', () => {
  it('filters the Almaty-region sample zones by risk level', async () => {
    const user = userEvent.setup();
    renderDemo('regional-risk');

    expect(screen.getByText('5 sample zones shown')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Risk level'), 'high');

    expect(screen.getByText('1 sample zones shown')).toBeInTheDocument();
    expect(screen.getByText('Talgar pass area (sample)')).toBeInTheDocument();
    expect(screen.queryByText('Charyn canyon (sample)')).not.toBeInTheDocument();
  });

  it('states that sample locations are not operational facilities', () => {
    renderDemo('regional-risk');

    expect(screen.getByText(/not operational facilities/i)).toBeInTheDocument();
    expect(screen.getByText(/NOT monitoring stations/)).toBeInTheDocument();
  });
});

describe('group demo', () => {
  it('advances all member statuses on demand', async () => {
    const user = userEvent.setup();
    renderDemo('group');

    expect(screen.getAllByText('Planning')).toHaveLength(4);

    await user.click(screen.getByRole('button', { name: 'Advance all statuses' }));

    expect(screen.getAllByText('In transit')).toHaveLength(4);
    expect(screen.getByText('All sample members advanced one status.')).toBeInTheDocument();
  });

  it('advances a single member and announces the change', async () => {
    const user = userEvent.setup();
    renderDemo('group');

    await user.click(screen.getByRole('button', { name: /Advance status . Aigul \(sample\)/ }));

    expect(screen.getByText(/Aigul \(sample\) is now: In transit/)).toBeInTheDocument();
    expect(screen.getAllByText('Planning')).toHaveLength(3);
    expect(screen.getAllByText('In transit')).toHaveLength(1);
  });

  it('is labelled as simulated with no server', () => {
    renderDemo('group');

    expect(screen.getByText('Simulated — no server')).toBeInTheDocument();
  });
});

describe('learning demo', () => {
  it('toggles mark-reviewed and shows progress', async () => {
    const user = userEvent.setup();
    renderDemo('learning');

    expect(screen.getByText('0 of 3 lessons marked reviewed')).toBeInTheDocument();

    await user.click(screen.getByLabelText(/Keeping a casualty warm/));

    expect(screen.getByText('1 of 3 lessons marked reviewed')).toBeInTheDocument();
    expect(screen.getByText('Marked reviewed (demo)')).toBeInTheDocument();
  });

  it('is explicitly not certified medical advice', () => {
    renderDemo('learning');

    expect(screen.getByText('Not certified medical advice')).toBeInTheDocument();
    expect(screen.getAllByText(/needs expert review/i).length).toBeGreaterThan(0);
  });
});

describe('check-in escalation demo', () => {
  it('escalates to a trusted-contact draft without ever claiming delivery', async () => {
    const user = userEvent.setup();
    const { container } = renderDemo('checkin-escalation');

    expect(screen.getByText('Check-in scheduled (sample)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Simulate a missed check-in' }));
    expect(screen.getByText('Check-in missed (sample)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Prepare the escalation draft' }));

    expect(screen.getByText('Escalation draft: SMS the trusted contact')).toBeInTheDocument();
    expect(screen.getAllByText('Requires integration').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Nothing leaves this device/)).toBeInTheDocument();
    expect(screen.getByText('Not transmitted — demo only')).toBeInTheDocument();

    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\bsent\b/i);
    expect(text).not.toMatch(/\bdelivered\b/i);
  });

  it('has no background scheduler — steps only change on user action', () => {
    renderDemo('checkin-escalation');

    expect(screen.queryByText('Check-in missed (sample)')).not.toBeInTheDocument();
    expect(screen.getByText(/nothing runs in the background/i)).toBeInTheDocument();
  });
});

describe('satellite demo', () => {
  it('never claims a real connection and labels the roadmap as unverified', async () => {
    const user = userEvent.setup();
    const { container } = renderDemo('satellite');

    expect(screen.getByText(/no satellite connection/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\bconnected\b/i);
    expect(screen.getAllByText(/Requires integration \/ unverified — no partnership claimed/)).toHaveLength(4);
    expect(screen.getByText(/no partnership is claimed/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add to queue' }));

    expect(screen.getByText('Sample queue: 1 message(s)')).toBeInTheDocument();
    expect(screen.getByText(/Queued at/)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\bconnected\b/i);
  });

  it('switches the highlighted sample relay path', async () => {
    const user = userEvent.setup();
    renderDemo('satellite');

    expect(screen.getByText(/Sample relay path: You → Relay A → Exit node/)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Relay device on the path'), 'relay-b');

    expect(screen.getByText(/Sample relay path: You → Relay B → Exit node/)).toBeInTheDocument();
  });
});
