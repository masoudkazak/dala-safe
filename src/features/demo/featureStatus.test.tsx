import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { writeEnvelope, STORAGE_KEYS } from '../../data/storage';
import type { FeatureState, LocalizedText } from '../../domain/types';
import { I18nProvider } from '../../i18n';
import { FEATURE_COUNT_BY_STATE, FEATURE_REGISTRY, FEATURE_STATES, getFeature } from './featureStatus';
import { FeatureStatusPage } from './FeatureStatusPage';

const VALID_STATES: FeatureState[] = ['available', 'demo', 'planned', 'requires-integration', 'needs-verification'];

const REQUIRED_IDS = [
  'trip-crud',
  'checklist',
  'safety-plan',
  'rule-guidance',
  'message-sharing',
  'calendar-ics',
  'emergency-screen',
  'geolocation',
  'phrasebook',
  'offline-pwa',
  'gpx-import-export',
  'data-management',
  'tour',
];

function isFilled(text: LocalizedText | undefined): boolean {
  if (!text) return false;
  return (['kk', 'ru', 'en'] as const).every((language) => typeof text[language] === 'string' && text[language].trim().length > 0);
}

function seedLanguage() {
  writeEnvelope(window.localStorage, STORAGE_KEYS.settings, {
    language: 'en',
    units: 'metric',
    onboardingComplete: true,
  });
}

function renderPage() {
  return render(
    <I18nProvider>
      <FeatureStatusPage />
    </I18nProvider>,
  );
}

describe('FEATURE_REGISTRY', () => {
  it('covers every required capability', () => {
    const ids = FEATURE_REGISTRY.map((feature) => feature.id);
    for (const id of REQUIRED_IDS) {
      expect(ids, `missing ${id}`).toContain(id);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses only the five known feature states', () => {
    expect([...FEATURE_STATES]).toEqual(VALID_STATES);
    for (const feature of FEATURE_REGISTRY) {
      expect(VALID_STATES, feature.id).toContain(feature.state);
    }
  });

  it('has kk, ru and en text for every label and note', () => {
    for (const feature of FEATURE_REGISTRY) {
      expect(isFilled(feature.label), `${feature.id} label`).toBe(true);
      expect(isFilled(feature.note), `${feature.id} note`).toBe(true);
    }
  });

  it('has a kk, ru and en production note for every entry that is not available', () => {
    for (const feature of FEATURE_REGISTRY) {
      if (feature.state === 'available') continue;
      expect(isFilled(feature.productionNote), `${feature.id} productionNote`).toBe(true);
    }
  });

  it('counts features per state', () => {
    for (const state of FEATURE_STATES) {
      const expected = FEATURE_REGISTRY.filter((feature) => feature.state === state).length;
      expect(FEATURE_COUNT_BY_STATE[state], state).toBe(expected);
    }
    const total = FEATURE_STATES.reduce((sum, state) => sum + FEATURE_COUNT_BY_STATE[state], 0);
    expect(total).toBe(FEATURE_REGISTRY.length);
  });

  it('looks features up by id', () => {
    const first = FEATURE_REGISTRY[0];
    expect(getFeature(first.id)).toBe(first);
    expect(getFeature('not-a-real-feature')).toBeUndefined();
  });
});

describe('FeatureStatusPage', () => {
  beforeEach(() => {
    seedLanguage();
  });

  it('shows the demo banner and a roadmap table grouped by state with counts', () => {
    renderPage();

    expect(screen.getByText(/Demo mode/)).toBeInTheDocument();

    const table = screen.getByRole('table');
    expect(within(table).getByRole('caption')).toHaveTextContent('Count of Dala Safe capabilities');
    expect(within(table).getAllByRole('columnheader')).toHaveLength(3);
    expect(within(table).getAllByRole('row')).toHaveLength(FEATURE_STATES.length + 2);
    expect(within(table).getAllByRole('rowheader')).toHaveLength(FEATURE_STATES.length + 1);

    const firstStateRow = within(table).getAllByRole('row')[1];
    const cells = within(firstStateRow).getAllByRole('cell');
    expect(within(firstStateRow).getByRole('rowheader')).toHaveTextContent('Available');
    expect(cells[0]).toHaveTextContent(String(FEATURE_COUNT_BY_STATE.available));
    expect(within(table).getByText('Total')).toBeInTheDocument();
  });

  it('renders one status badge per roadmap row and one per capability card', () => {
    const { container } = renderPage();

    const badges = container.querySelectorAll('.badge');
    expect(badges.length).toBe(FEATURE_REGISTRY.length + FEATURE_STATES.length);
  });

  it('lists every capability with its status and production note', () => {
    renderPage();

    for (const feature of FEATURE_REGISTRY) {
      expect(screen.getByRole('heading', { level: 4, name: feature.label.en }), feature.id).toBeInTheDocument();
    }
    const pending = FEATURE_REGISTRY.filter((feature) => feature.state !== 'available');
    expect(screen.getAllByText(/What production would require/)).toHaveLength(pending.length);
  });

  it('uses table and list semantics', () => {
    renderPage();

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Future features' })).toBeInTheDocument();
    const lists = screen.getAllByRole('list');
    const nonEmptyStates = FEATURE_STATES.filter((state) =>
      FEATURE_REGISTRY.some((feature) => feature.state === state),
    );
    expect(lists).toHaveLength(nonEmptyStates.length);
    expect(screen.getAllByRole('listitem')).toHaveLength(FEATURE_REGISTRY.length);
  });
});
