import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18nProvider } from '../../i18n';
import { RouteMap } from './RouteMap';

beforeEach(() => {
  window.localStorage.setItem(
    'dala-safe:v1:settings',
    JSON.stringify({
      version: 1,
      savedAt: '2026-01-01T00:00:00.000Z',
      data: { language: 'en', units: 'metric', onboardingComplete: false },
    }),
  );
});

describe('RouteMap', () => {
  it('renders an accessible normalized polyline with start and end markers', () => {
    render(
      <I18nProvider>
        <RouteMap
          track={{
            name: 'Ridge',
            points: [
              { lat: 43, lon: 76 },
              { lat: 43.01, lon: 76.01 },
              { lat: 43.02, lon: 76.005 },
            ],
          }}
        />
      </I18nProvider>,
    );

    const svg = screen.getByRole('img');
    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 640 360');

    const polyline = svg.querySelector('polyline');
    expect(polyline).not.toBeNull();
    expect(polyline?.getAttribute('points')?.split(' ')).toHaveLength(3);
    expect(polyline?.getAttribute('fill')).toBe('none');

    expect(svg.querySelectorAll('circle')).toHaveLength(2);
    expect(svg.querySelector('title')?.textContent).toBe('Route preview: Ridge');
    expect(svg.querySelector('desc')?.textContent).toContain('3 track points');
    expect(svg.querySelectorAll('circle title')[0].textContent).toBe('Start');
    expect(svg.querySelectorAll('circle title')[1].textContent).toBe('End');
  });

  it('shows a safe empty state when there are no valid points', () => {
    render(
      <I18nProvider>
        <RouteMap track={{ name: 'Empty', points: [] }} />
      </I18nProvider>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('No points to draw.');
    expect(screen.queryByRole('img')).toBeNull();
  });
});
