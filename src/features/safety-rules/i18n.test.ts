import { describe, expect, it } from 'vitest';
import enSafety from '../../locales/en/safety.json';
import kkSafety from '../../locales/kk/safety.json';
import ruSafety from '../../locales/ru/safety.json';

const resources = {
  en: enSafety as Record<string, string>,
  kk: kkSafety as Record<string, string>,
  ru: ruSafety as Record<string, string>,
};

const REQUIRED_KEYS = [
  'safety.title',
  'safety.subtitle',
  'safety.form.title',
  'safety.duration',
  'safety.durationHint',
  'safety.durationInvalid',
  'safety.experience',
  'safety.experience.first',
  'safety.experience.some',
  'safety.experience.experienced',
  'safety.connectivity',
  'safety.connectivity.none',
  'safety.connectivity.unreliable',
  'safety.connectivity.good',
  'safety.forecast',
  'safety.forecast.yes',
  'safety.forecast.no',
  'safety.route',
  'safety.route.marked',
  'safety.route.unmarked',
  'safety.route.unknown',
  'safety.notSpecified',
  'safety.generate',
  'safety.recommendations',
  'safety.noRecommendations',
  'safety.why',
  'safety.source',
  'safety.source.open',
  'safety.lastVerified',
  'safety.classification.general',
  'safety.classification.official',
  'safety.severity.info',
  'safety.severity.caution',
  'safety.severity.critical',
  'safety.reviewStatus',
  'safety.reviewStatus.unreviewed',
  'safety.reviewStatus.machine-translated',
  'safety.reviewStatus.human-review-required',
  'safety.reviewStatus.human-reviewed',
  'safety.translationStatus',
  'safety.translationStatus.machine-assisted',
  'safety.translationStatus.human-reviewed',
  'safety.disclaimer',
  'safety.missingInputs',
  'safety.missingInputs.detail',
  'safety.completeness',
  'safety.saved',
  'safety.backToTrip',
  'safety.tripNotFound.title',
  'safety.tripNotFound.body',
  'safety.tripNotFound.back',
  'safety.reason.durationMin',
  'safety.reason.durationMax',
  'safety.reason.durationBetween',
  'safety.reason.durationKnown',
  'safety.reason.durationUnknown',
  'safety.reason.connectivity',
  'safety.reason.connectivityUnknown',
  'safety.reason.groupExperience',
  'safety.reason.groupExperienceUnknown',
  'safety.reason.forecastChecked',
  'safety.reason.forecastUnchecked',
  'safety.reason.forecastUnknown',
  'safety.reason.routeType',
  'safety.reason.routeTypeUnknown',
];

describe('safety locale files', () => {
  it('use the same key set in kk, ru and en', () => {
    const englishKeys = Object.keys(resources.en).sort();
    expect(Object.keys(resources.kk).sort()).toEqual(englishKeys);
    expect(Object.keys(resources.ru).sort()).toEqual(englishKeys);
  });

  it('include every key used by the guidance page and engine', () => {
    for (const language of ['kk', 'ru', 'en'] as const) {
      for (const key of REQUIRED_KEYS) {
        expect(typeof resources[language][key], `${language}:${key}`).toBe('string');
      }
    }
  });

  it('has no empty translations and keeps placeholders aligned', () => {
    for (const language of ['kk', 'ru', 'en'] as const) {
      for (const [key, value] of Object.entries(resources[language])) {
        expect(value.trim().length, `${language}:${key}`).toBeGreaterThan(0);
      }
    }

    const placeholders = (value: string) => (value.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(resources.en)) {
      expect(placeholders(resources.kk[key]), `kk:${key}`).toEqual(placeholders(resources.en[key]));
      expect(placeholders(resources.ru[key]), `ru:${key}`).toEqual(placeholders(resources.en[key]));
    }
  });
});
