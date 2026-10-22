import { describe, expect, it } from 'vitest';
import { GUIDANCE_CATALOG } from './catalog';
import {
  evaluateGuidance,
  getMissingInputs,
  inputCompleteness,
  type GuidanceInput,
  type GuidanceSeverity,
} from './engine';

const SEVERITY_ORDER: Record<GuidanceSeverity, number> = {
  critical: 0,
  caution: 1,
  info: 2,
};

function matchedIds(input: GuidanceInput, language: 'en' | 'kk' | 'ru' = 'en'): string[] {
  return evaluateGuidance(input, { language }).map((match) => match.rule.id);
}

describe('evaluateGuidance duration boundaries', () => {
  it('matches the long-trip rule at exactly 6 hours but not at 5.9', () => {
    expect(matchedIds({ durationHours: 5.9 })).not.toContain('long-duration');
    expect(matchedIds({ durationHours: 6 })).toContain('long-duration');
  });

  it('matches the extended-trip rule at exactly 10 hours but not at 9.9', () => {
    expect(matchedIds({ durationHours: 9.9 })).not.toContain('extended-duration');
    expect(matchedIds({ durationHours: 10 })).toContain('extended-duration');
  });

  it('treats zero, negative, NaN and infinite duration as unknown', () => {
    for (const value of [0, -3, Number.NaN, Number.POSITIVE_INFINITY]) {
      const input = { durationHours: value };
      expect(matchedIds(input)).not.toContain('long-duration');
      expect(matchedIds(input)).not.toContain('extended-duration');
      expect(getMissingInputs(input)).toContain('durationHours');
    }
  });
});

describe('evaluateGuidance per-input matching', () => {
  it('matches connectivity rules without over-matching', () => {
    expect(matchedIds({ connectivity: 'none', routeType: 'marked' })).toContain('no-connectivity');
    expect(matchedIds({ connectivity: 'none', routeType: 'marked' })).not.toContain('no-signal-unmarked-route');
    expect(matchedIds({ connectivity: 'none', routeType: 'unmarked' })).toContain('no-signal-unmarked-route');
    expect(matchedIds({ connectivity: 'unreliable' })).toContain('unreliable-connectivity');
    expect(matchedIds({ connectivity: 'unreliable' })).not.toContain('no-connectivity');
    expect(matchedIds({ connectivity: null })).not.toContain('no-connectivity');
  });

  it('matches first-time group experience only for that value', () => {
    expect(matchedIds({ groupExperience: 'first-time' })).toContain('first-time-group');
    expect(matchedIds({ groupExperience: 'some' })).not.toContain('first-time-group');
    expect(matchedIds({ groupExperience: 'experienced' })).not.toContain('first-time-group');
  });

  it('matches the forecast reminder when unchecked or unknown, but not when checked', () => {
    expect(matchedIds({ forecastAvailable: false })).toContain('forecast-not-checked');
    expect(matchedIds({ forecastAvailable: null })).toContain('forecast-not-checked');
    expect(matchedIds({ forecastAvailable: true })).not.toContain('forecast-not-checked');
  });

  it('distinguishes unmarked from unknown routes', () => {
    expect(matchedIds({ routeType: 'unmarked' })).toContain('unmarked-route');
    expect(matchedIds({ routeType: 'unmarked' })).not.toContain('unknown-route');
    expect(matchedIds({ routeType: 'unknown' })).toContain('unknown-route');
    expect(matchedIds({ routeType: null })).toContain('unknown-route');
    expect(matchedIds({ routeType: 'marked' })).not.toContain('unknown-route');
  });

  it('raises the combined no-signal unmarked-route rule when both inputs match', () => {
    expect(matchedIds({ connectivity: 'none', routeType: 'unmarked' })).toContain('no-signal-unmarked-route');
    expect(matchedIds({ connectivity: 'none', routeType: 'unknown' })).toContain('no-signal-unmarked-route');
    expect(matchedIds({ connectivity: 'none', routeType: null })).toContain('no-signal-unmarked-route');
    expect(matchedIds({ connectivity: 'good', routeType: 'unmarked' })).not.toContain('no-signal-unmarked-route');
  });
});

describe('evaluateGuidance safe defaults', () => {
  it('returns no recommendations for complete low-risk input', () => {
    expect(
      evaluateGuidance({
        durationHours: 3,
        groupExperience: 'some',
        connectivity: 'good',
        forecastAvailable: true,
        routeType: 'marked',
      }),
    ).toEqual([]);
  });

  it('uses conservative reminders when all inputs are missing without asserting specific risks', () => {
    const ids = matchedIds({});
    expect(ids).toContain('forecast-not-checked');
    expect(ids).toContain('unknown-route');
    expect(ids).toContain('plan-sharing');
    expect(ids).toContain('emergency-numbers');
    expect(ids).not.toContain('no-connectivity');
    expect(ids).not.toContain('unmarked-route');
    expect(ids).not.toContain('first-time-group');
    expect(ids).not.toContain('no-signal-unmarked-route');
  });

  it('explains an unknown forecast as unconfirmed rather than unchecked', () => {
    const match = evaluateGuidance({ forecastAvailable: null }, { language: 'en' }).find(
      (entry) => entry.rule.id === 'forecast-not-checked',
    );
    expect(match?.reasons.join(' ')).toContain('not confirmed');
  });

  it('does not fill in contradictory inputs with assumed facts', () => {
    const matches = evaluateGuidance({
      durationHours: -1,
      groupExperience: 'experienced',
      connectivity: 'good',
      forecastAvailable: true,
      routeType: 'marked',
    });
    expect(matches).toEqual([]);
  });
});

describe('evaluateGuidance ordering and reasons', () => {
  it('returns critical, caution and info matches in deterministic order', () => {
    const input: GuidanceInput = {
      durationHours: 12,
      groupExperience: 'first-time',
      connectivity: 'none',
      forecastAvailable: false,
      routeType: 'unmarked',
    };

    const first = evaluateGuidance(input, { language: 'en' });
    const second = evaluateGuidance(input, { language: 'en' });

    expect(first.map((match) => match.rule.id)).toEqual(second.map((match) => match.rule.id));
    expect(first[0].severity).toBe('critical');
    for (let index = 1; index < first.length; index += 1) {
      expect(SEVERITY_ORDER[first[index - 1].severity]).toBeLessThanOrEqual(SEVERITY_ORDER[first[index].severity]);
    }
  });

  it('always provides a reason for every match', () => {
    const matches = evaluateGuidance({
      durationHours: 12,
      groupExperience: 'first-time',
      connectivity: 'none',
      forecastAvailable: false,
      routeType: 'unmarked',
    });
    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) {
      expect(match.reasons.length).toBeGreaterThan(0);
      for (const reason of match.reasons) expect(reason.trim().length).toBeGreaterThan(0);
    }
  });

  it('localizes every reason without falling back to a raw key', () => {
    const input: GuidanceInput = {
      durationHours: 12,
      groupExperience: 'first-time',
      connectivity: 'none',
      forecastAvailable: null,
      routeType: null,
    };
    for (const language of ['en', 'ru', 'kk'] as const) {
      const matches = evaluateGuidance(input, { language });
      expect(matches.length).toBeGreaterThan(0);
      for (const match of matches) {
        for (const reason of match.reasons) {
          expect(reason.startsWith('safety.')).toBe(false);
          expect(reason.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('evaluateGuidance catalog integrity', () => {
  it('contains at least eight meaningful rules', () => {
    expect(GUIDANCE_CATALOG.rules.length).toBeGreaterThanOrEqual(8);
  });

  it('gives every rule a source, review status, translation status and three-language text', () => {
    for (const rule of GUIDANCE_CATALOG.rules) {
      expect(rule.source.publisher.trim().length).toBeGreaterThan(0);
      expect(rule.source.url).toMatch(/^https:\/\//);
      expect(rule.source.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(['unreviewed', 'machine-translated', 'human-review-required', 'human-reviewed']).toContain(
        rule.source.reviewStatus,
      );
      expect(['machine-assisted', 'human-reviewed']).toContain(rule.translationStatus);
      for (const language of ['kk', 'ru', 'en'] as const) {
        expect(rule.title[language].trim().length).toBeGreaterThan(0);
        expect(rule.explanation[language].trim().length).toBeGreaterThan(0);
        expect(rule.source.note[language].trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('never claims that a rule guarantees safety', () => {
    const forbidden = /guarantees? safety|guaranteed safety|safety is guaranteed/i;
    for (const rule of GUIDANCE_CATALOG.rules) {
      expect(rule.explanation.en).not.toMatch(forbidden);
      expect(rule.title.en).not.toMatch(forbidden);
    }
  });
});

describe('inputCompleteness', () => {
  it('reports missing inputs without producing a safety score', () => {
    expect(inputCompleteness({})).toEqual({
      provided: 0,
      total: 5,
      missing: ['durationHours', 'groupExperience', 'connectivity', 'forecastAvailable', 'routeType'],
    });
  });

  it('counts provided inputs and treats invalid duration as missing', () => {
    const result = inputCompleteness({
      durationHours: 0,
      groupExperience: 'some',
      connectivity: 'good',
      forecastAvailable: true,
      routeType: 'marked',
    });
    expect(result.provided).toBe(4);
    expect(result.missing).toEqual(['durationHours']);
  });

  it('returns the same missing list as getMissingInputs', () => {
    const input: GuidanceInput = { durationHours: 4, connectivity: 'none' };
    expect(inputCompleteness(input).missing).toEqual(getMissingInputs(input));
  });
});
