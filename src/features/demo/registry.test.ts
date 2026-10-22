import { describe, expect, it } from 'vitest';
import { RESOURCES } from '../../i18n';
import { DEMO_REGISTRY, getDemoDefinition, listDemoDefinitions } from './registry';
import { DEMO_IDS, isDemoId } from './types';

const LANGUAGES = ['en', 'kk', 'ru'] as const;

describe('demo registry', () => {
  it('covers exactly the seven planned demos', () => {
    expect([...DEMO_IDS]).toEqual([
      'route-planning',
      'weather',
      'regional-risk',
      'group',
      'learning',
      'checkin-escalation',
      'satellite',
    ]);
    expect(Object.keys(DEMO_REGISTRY).sort()).toEqual([...DEMO_IDS].sort());
    expect(listDemoDefinitions()).toHaveLength(DEMO_IDS.length);
  });

  it('every definition has a component, an honest state, and translated keys', () => {
    for (const id of DEMO_IDS) {
      const definition = getDemoDefinition(id);
      expect(definition).not.toBeNull();
      expect(definition?.component).toBeTypeOf('function');
      expect(['demo', 'requires-integration']).toContain(definition?.state);

      const keys = [definition?.titleKey, definition?.summaryKey, definition?.productionKey];
      for (const key of keys) {
        expect(key).toMatch(/^demo\./);
        for (const language of LANGUAGES) {
          expect(RESOURCES[language].demo[key ?? '']).toBeTypeOf('string');
        }
      }
    }
  });

  it('looks up known ids and rejects unknown ones', () => {
    for (const id of DEMO_IDS) {
      expect(getDemoDefinition(id)?.id).toBe(id);
    }
    expect(getDemoDefinition('nope')).toBeNull();
    expect(getDemoDefinition('')).toBeNull();
    expect(getDemoDefinition('constructor')).toBeNull();
    expect(isDemoId('weather')).toBe(true);
    expect(isDemoId('weather-2')).toBe(false);
  });
});
